import { NextResponse } from "next/server";
import { requireAuthAPI } from "@/lib/authorize";
import { getDb } from "@/lib/db";
import { z } from "zod";

const updateProfileSchema = z.object({
  name: z.string().min(1, "Name is required").max(100).optional(),
  bio: z.string().max(1000).optional().default(""),
  designation: z.string().max(100).optional().default(""),
  department: z.string().max(100).optional().default(""),
});

// GET /api/user/profile — current user's profile
export async function GET() {
  const { session, error } = await requireAuthAPI();
  if (error) return error;

  return NextResponse.json({ user: session.user });
}

// PATCH /api/user/profile — update own profile
export async function PATCH(request) {
  const { session, error } = await requireAuthAPI();
  if (error) return error;

  try {
    const body = await request.json();
    const validated = updateProfileSchema.parse(body);

    const db = await getDb();
    const updateFields = {};

    if (validated.name !== undefined) updateFields.name = validated.name;
    if (validated.bio !== undefined) updateFields.bio = validated.bio;
    if (validated.designation !== undefined) updateFields.designation = validated.designation;
    if (validated.department !== undefined) updateFields.department = validated.department;
    updateFields.updatedAt = new Date();

    await db.collection("user").updateOne(
      { id: session.user.id },
      { $set: updateFields }
    );

    return NextResponse.json({ success: true, updated: updateFields });
  } catch (err) {
    if (err.name === "ZodError") {
      return NextResponse.json(
        { error: "Validation failed", details: err.errors },
        { status: 400 }
      );
    }
    console.error("Profile update failed:", err);
    return NextResponse.json({ error: "Failed to update profile" }, { status: 500 });
  }
}
