import { NextResponse } from "next/server";
import { getCollection, COLLECTIONS } from "@/lib/db";
import { requireAuthAPI } from "@/lib/authorize";

export async function GET() {
  try {
    const homepageDb = await getCollection(COLLECTIONS.HOMEPAGE);
    let config = await homepageDb.findOne({ type: "main" });
    
    if (!config) {
      config = { type: "main", heroStories: [], topNews: [] };
    }
    
    return NextResponse.json(config);
  } catch (err) {
    console.error("Failed to fetch homepage config:", err);
    return NextResponse.json({ error: "Failed to fetch homepage config" }, { status: 500 });
  }
}

export async function PUT(request) {
  try {
    const { session, error } = await requireAuthAPI();
    if (error) return error;

    if (!["editor", "admin"].includes(session.user.role)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await request.json();
    const homepageDb = await getCollection(COLLECTIONS.HOMEPAGE);
    
    const result = await homepageDb.updateOne(
      { type: "main" },
      { $set: { 
          heroStories: body.heroStories || [], 
          topNews: body.topNews || [],
          updatedAt: new Date(),
          updatedBy: session.user.id
        } 
      },
      { upsert: true }
    );
    
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Failed to update homepage config:", err);
    return NextResponse.json({ error: "Failed to update homepage config" }, { status: 500 });
  }
}
