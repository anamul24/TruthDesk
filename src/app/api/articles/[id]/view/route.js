import { NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import { getCollection, COLLECTIONS } from "@/lib/db";

// POST /api/articles/[id]/view — track a view, 24-hour dedup
export async function POST(request, { params }) {
  try {
    const { id } = await params;
    const body = await request.json().catch(() => ({}));
    const { visitorId } = body;

    if (!visitorId) {
      return NextResponse.json({ error: "visitorId required" }, { status: 400 });
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

    const viewsCollection = await getCollection(COLLECTIONS.NEWS_VIEWS);
    
    // Check if this visitor viewed this article in the last 24 hours
    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const existingView = await viewsCollection.findOne({
      newsId: article._id.toString(),
      visitorId,
      createdAt: { $gte: twentyFourHoursAgo }
    });

    if (existingView) {
      // Already viewed in the last 24 hours
      return NextResponse.json({ counted: false });
    }

    // Insert new view record
    await viewsCollection.insertOne({
      newsId: article._id.toString(),
      visitorId,
      createdAt: new Date(),
    });

    // Increment article view count
    await articlesCollection.updateOne(
      { _id: article._id },
      { $inc: { "stats.views": 1 } }
    );

    return NextResponse.json({ counted: true });
  } catch (err) {
    console.error("Failed to track view:", err);
    return NextResponse.json({ error: "Failed to track view" }, { status: 500 });
  }
}
