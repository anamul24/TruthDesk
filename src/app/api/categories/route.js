import { NextResponse } from "next/server";
import { getCollection, COLLECTIONS } from "@/lib/db";
import { requireRoleAPI } from "@/lib/authorize";
import { USER_ROLES } from "@/lib/validations";
import { categorySchema } from "@/lib/validations";

// GET /api/categories — public, returns all categories
export async function GET() {
  try {
    const collection = await getCollection(COLLECTIONS.CATEGORIES);
    const categories = await collection.find({}).sort({ name: 1 }).toArray();
    return NextResponse.json({ categories });
  } catch (error) {
    console.error("Failed to fetch categories:", error);
    return NextResponse.json(
      { error: "Failed to fetch categories" },
      { status: 500 }
    );
  }
}

// POST /api/categories — admin only, create category
export async function POST(request) {
  const { session, error } = await requireRoleAPI([USER_ROLES.ADMIN]);
  if (error) return error;

  try {
    const body = await request.json();
    const validated = categorySchema.parse(body);

    const collection = await getCollection(COLLECTIONS.CATEGORIES);

    // Check slug uniqueness
    const existing = await collection.findOne({ slug: validated.slug });
    if (existing) {
      return NextResponse.json(
        { error: "A category with this slug already exists" },
        { status: 409 }
      );
    }

    const now = new Date();
    const doc = {
      ...validated,
      createdAt: now,
      updatedAt: now,
      createdBy: session.user.id,
    };

    const result = await collection.insertOne(doc);
    return NextResponse.json(
      { success: true, categoryId: result.insertedId },
      { status: 201 }
    );
  } catch (err) {
    if (err.name === "ZodError") {
      return NextResponse.json(
        { error: "Validation failed", details: err.errors },
        { status: 400 }
      );
    }
    console.error("Failed to create category:", err);
    return NextResponse.json(
      { error: "Failed to create category" },
      { status: 500 }
    );
  }
}
