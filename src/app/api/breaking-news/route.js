import { NextResponse } from "next/server";
import { getCollection, COLLECTIONS } from "@/lib/db";
import { requireAuthAPI } from "@/lib/authorize";

// GET /api/breaking-news — public, returns non-expired breaking news
export async function GET() {
  try {
    const collection = await getCollection(COLLECTIONS.BREAKING_NEWS);
    const now = new Date();

    const items = await collection
      .find({
        $or: [
          { expiresAt: { $exists: false } },
          { expiresAt: null },
          { expiresAt: { $gt: now } },
        ],
      })
      .sort({ createdAt: -1 })
      .limit(10)
      .toArray();

    return NextResponse.json({
      items: items.map((item) => ({
        _id: item._id.toString(),
        text: item.text,
        url: item.url || null,
        expiresAt: item.expiresAt,
        createdAt: item.createdAt,
        createdBy: item.createdBy,
      })),
    });
  } catch (err) {
    console.error("Failed to fetch breaking news:", err);
    return NextResponse.json({ error: "Failed to fetch breaking news" }, { status: 500 });
  }
}

// POST /api/breaking-news — editor/admin only: create breaking news item
export async function POST(request) {
  try {
    const { session, error } = await requireAuthAPI();
    if (error) return error;

    if (!["editor", "admin"].includes(session.user.role)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await request.json();
    const { text, url, expiresAt } = body;

    if (!text || text.trim().length < 3) {
      return NextResponse.json({ error: "Breaking news text is required (min 3 chars)" }, { status: 400 });
    }

    const collection = await getCollection(COLLECTIONS.BREAKING_NEWS);

    const doc = {
      text: text.trim(),
      url: url?.trim() || null,
      expiresAt: expiresAt ? new Date(expiresAt) : null,
      createdAt: new Date(),
      createdBy: session.user.name,
      createdById: session.user.id,
    };

    const result = await collection.insertOne(doc);

    return NextResponse.json({
      success: true,
      _id: result.insertedId.toString(),
    }, { status: 201 });
  } catch (err) {
    console.error("Failed to create breaking news:", err);
    return NextResponse.json({ error: "Failed to create breaking news" }, { status: 500 });
  }
}
