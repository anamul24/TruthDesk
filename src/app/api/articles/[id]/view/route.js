import { NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import { getCollection, COLLECTIONS } from "@/lib/db";

// POST /api/articles/[id]/view — track a view, session-based dedup
export async function POST(request, { params }) {
  try {
    const { id } = await params;
    const body = await request.json().catch(() => ({}));
    const { sessionId } = body;

    if (!sessionId) {
      return NextResponse.json({ error: "sessionId required" }, { status: 400 });
    }

    // Validate article exists and is published
    const articlesCollection = await getCollection(COLLECTIONS.ARTICLES);
    let articleQuery;
    try {
      articleQuery = { _id: new ObjectId(id), status: "PUBLISHED" };
    } catch {
      return NextResponse.json({ error: "Invalid article ID" }, { status: 400 });
    }

    const article = await articlesCollection.findOne(articleQuery, { projection: { _id: 1 } });
    if (!article) {
      return NextResponse.json({ counted: false });
    }

    const viewsCollection = await getCollection(COLLECTIONS.ARTICLE_VIEWS);

    // Try to insert a view record — unique index on (articleId, sessionId) prevents dups
    try {
      await viewsCollection.insertOne({
        articleId: article._id.toString(),
        sessionId,
        viewedAt: new Date(),
      });

      // Only increment counter if the insert succeeded (no duplicate)
      await articlesCollection.updateOne(
        { _id: article._id },
        { $inc: { "stats.views": 1 } }
      );

      return NextResponse.json({ counted: true });
    } catch (dupError) {
      // Duplicate key error means this session already viewed this article
      if (dupError.code === 11000) {
        return NextResponse.json({ counted: false });
      }
      throw dupError;
    }
  } catch (err) {
    console.error("Failed to track view:", err);
    return NextResponse.json({ error: "Failed to track view" }, { status: 500 });
  }
}
