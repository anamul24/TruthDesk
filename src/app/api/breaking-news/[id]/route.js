import { NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import { getCollection, COLLECTIONS } from "@/lib/db";
import { requireAuthAPI } from "@/lib/authorize";

// PUT /api/breaking-news/[id] — edit breaking news
export async function PUT(request, { params }) {
  try {
    const { session, error } = await requireAuthAPI();
    if (error) return error;

    if (!["editor", "admin"].includes(session.user.role)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { id } = await params;
    const body = await request.json();
    const { text, url, expiresAt } = body;

    if (!text || text.trim().length < 3) {
      return NextResponse.json({ error: "Text is required" }, { status: 400 });
    }

    const collection = await getCollection(COLLECTIONS.BREAKING_NEWS);
    const result = await collection.updateOne(
      { _id: new ObjectId(id) },
      {
        $set: {
          text: text.trim(),
          url: url?.trim() || null,
          expiresAt: expiresAt ? new Date(expiresAt) : null,
          updatedAt: new Date(),
          updatedBy: session.user.name,
        },
      }
    );

    if (result.matchedCount === 0) {
      return NextResponse.json({ error: "Breaking news not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Failed to update breaking news:", err);
    return NextResponse.json({ error: "Failed to update breaking news" }, { status: 500 });
  }
}

// DELETE /api/breaking-news/[id] — delete breaking news
export async function DELETE(request, { params }) {
  try {
    const { session, error } = await requireAuthAPI();
    if (error) return error;

    if (!["editor", "admin"].includes(session.user.role)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { id } = await params;
    const collection = await getCollection(COLLECTIONS.BREAKING_NEWS);
    const result = await collection.deleteOne({ _id: new ObjectId(id) });

    if (result.deletedCount === 0) {
      return NextResponse.json({ error: "Breaking news not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Failed to delete breaking news:", err);
    return NextResponse.json({ error: "Failed to delete breaking news" }, { status: 500 });
  }
}
