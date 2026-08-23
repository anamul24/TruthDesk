import { NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import { getCollection, COLLECTIONS } from "@/lib/db";
import { requireAuthAPI } from "@/lib/authorize";
import { commentSchema } from "@/lib/validations";

// GET comments for an article
export async function GET(request, { params }) {
  try {
    const { session, error } = await requireAuthAPI();
    if (error) return error;

    const { id } = await params;
    const collection = await getCollection(COLLECTIONS.EDITOR_COMMENTS);

    const comments = await collection
      .find({ articleId: id })
      .sort({ createdAt: -1 })
      .toArray();

    const serialized = comments.map((c) => ({
      ...c,
      _id: c._id.toString(),
    }));

    return NextResponse.json({ comments: serialized });
  } catch (err) {
    console.error("Failed to fetch comments:", err);
    return NextResponse.json({ error: "Failed to fetch comments" }, { status: 500 });
  }
}

// POST a new comment
export async function POST(request, { params }) {
  try {
    const { session, error } = await requireAuthAPI();
    if (error) return error;

    const { id } = await params;
    const body = await request.json();

    const collection = await getCollection(COLLECTIONS.EDITOR_COMMENTS);
    await collection.insertOne({
      articleId: id,
      content: body.content,
      type: "comment",
      authorId: session.user.id,
      authorName: session.user.name,
      createdAt: new Date(),
    });

    return NextResponse.json({ success: true }, { status: 201 });
  } catch (err) {
    console.error("Failed to add comment:", err);
    return NextResponse.json({ error: "Failed to add comment" }, { status: 500 });
  }
}
