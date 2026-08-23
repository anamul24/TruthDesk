import { NextResponse } from "next/server";
import { getCollection, COLLECTIONS } from "@/lib/db";
import { requireRoleAPI } from "@/lib/authorize";
import { USER_ROLES } from "@/lib/validations";
import { ObjectId } from "mongodb";

// PATCH /api/categories/[id] — admin only, update category
export async function PATCH(request, { params }) {
  const { session, error } = await requireRoleAPI([USER_ROLES.ADMIN]);
  if (error) return error;

  try {
    const { id } = await params;
    const body = await request.json();

    const collection = await getCollection(COLLECTIONS.CATEGORIES);
    const updateFields = {};

    if (body.name) updateFields.name = body.name.trim();
    if (body.slug) updateFields.slug = body.slug.trim();
    if (body.description !== undefined)
      updateFields.description = body.description.trim();
    updateFields.updatedAt = new Date();

    // Check slug uniqueness if changing slug
    if (updateFields.slug) {
      const existing = await collection.findOne({
        slug: updateFields.slug,
        _id: { $ne: new ObjectId(id) },
      });
      if (existing) {
        return NextResponse.json(
          { error: "A category with this slug already exists" },
          { status: 409 }
        );
      }
    }

    const result = await collection.updateOne(
      { _id: new ObjectId(id) },
      { $set: updateFields }
    );

    if (result.matchedCount === 0) {
      return NextResponse.json(
        { error: "Category not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Failed to update category:", err);
    return NextResponse.json(
      { error: "Failed to update category" },
      { status: 500 }
    );
  }
}

// DELETE /api/categories/[id] — admin only, delete category
export async function DELETE(request, { params }) {
  const { error } = await requireRoleAPI([USER_ROLES.ADMIN]);
  if (error) return error;

  try {
    const { id } = await params;
    const collection = await getCollection(COLLECTIONS.CATEGORIES);

    const result = await collection.deleteOne({ _id: new ObjectId(id) });

    if (result.deletedCount === 0) {
      return NextResponse.json(
        { error: "Category not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Failed to delete category:", err);
    return NextResponse.json(
      { error: "Failed to delete category" },
      { status: 500 }
    );
  }
}
