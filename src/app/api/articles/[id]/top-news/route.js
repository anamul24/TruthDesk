import { NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import { getCollection, COLLECTIONS } from "@/lib/db";
import { requireAuthAPI } from "@/lib/authorize";
import { revalidatePath } from "next/cache";

// POST /api/articles/[id]/top-news — set/schedule top news
export async function POST(request, { params }) {
  try {
    const { session, error } = await requireAuthAPI();
    if (error) return error;

    if (!["editor", "admin"].includes(session.user.role)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { id } = await params;
    const body = await request.json();
    const { topNewsStartAt, topNewsEndAt } = body;

    const collection = await getCollection(COLLECTIONS.ARTICLES);
    const article = await collection.findOne({ _id: new ObjectId(id) });

    if (!article) {
      return NextResponse.json({ error: "Article not found" }, { status: 404 });
    }

    if (article.status !== "PUBLISHED") {
      return NextResponse.json({ error: "Only published articles can be set as Top News" }, { status: 400 });
    }

    await collection.updateOne(
      { _id: new ObjectId(id) },
      {
        $set: {
          "editorial.topNews": true,
          "editorial.topNewsStartAt": topNewsStartAt ? new Date(topNewsStartAt) : null,
          "editorial.topNewsEndAt": topNewsEndAt ? new Date(topNewsEndAt) : null,
          "editorial.topNewsSetBy": session.user.name,
          updatedAt: new Date(),
        },
      }
    );

    revalidatePath("/");
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Failed to set top news:", err);
    return NextResponse.json({ error: "Failed to set top news" }, { status: 500 });
  }
}

// DELETE /api/articles/[id]/top-news — remove top news priority
export async function DELETE(request, { params }) {
  try {
    const { session, error } = await requireAuthAPI();
    if (error) return error;

    if (!["editor", "admin"].includes(session.user.role)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { id } = await params;
    const collection = await getCollection(COLLECTIONS.ARTICLES);

    const result = await collection.updateOne(
      { _id: new ObjectId(id) },
      {
        $set: {
          "editorial.topNews": false,
          "editorial.topNewsStartAt": null,
          "editorial.topNewsEndAt": null,
          updatedAt: new Date(),
        },
      }
    );

    if (result.matchedCount === 0) {
      return NextResponse.json({ error: "Article not found" }, { status: 404 });
    }

    revalidatePath("/");
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Failed to remove top news:", err);
    return NextResponse.json({ error: "Failed to remove top news" }, { status: 500 });
  }
}
