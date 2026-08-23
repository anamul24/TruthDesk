import { NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import { getCollection, COLLECTIONS } from "@/lib/db";
import { requireAuthAPI } from "@/lib/authorize";

// GET versions for an article
export async function GET(request, { params }) {
  try {
    const { session, error } = await requireAuthAPI();
    if (error) return error;

    const { id } = await params;
    const collection = await getCollection(COLLECTIONS.ARTICLE_REVISIONS);

    const versions = await collection
      .find({ articleId: id })
      .sort({ version: -1 })
      .toArray();

    const serialized = versions.map((v) => ({
      ...v,
      _id: v._id.toString(),
    }));

    return NextResponse.json({ versions: serialized });
  } catch (err) {
    console.error("Failed to fetch versions:", err);
    return NextResponse.json({ error: "Failed to fetch versions" }, { status: 500 });
  }
}
