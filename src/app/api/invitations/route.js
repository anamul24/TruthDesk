import { NextResponse } from "next/server";
import { getCollection, COLLECTIONS } from "@/lib/db";
import { requireAuthAPI } from "@/lib/authorize";
import { USER_ROLES } from "@/lib/validations";
import crypto from "crypto";

export async function GET(request) {
  try {
    const { session, error } = await requireAuthAPI([USER_ROLES.ADMIN]);
    if (error) return error;

    const collection = await getCollection(COLLECTIONS.INVITATIONS);
    const invitations = await collection.find({}).sort({ createdAt: -1 }).toArray();

    return NextResponse.json({ invitations });
  } catch (err) {
    return NextResponse.json({ error: "Failed to fetch invitations" }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const { session, error } = await requireAuthAPI([USER_ROLES.ADMIN]);
    if (error) return error;

    const body = await request.json();
    const { email, role } = body;

    if (!email || !role || ![USER_ROLES.JOURNALIST, USER_ROLES.EDITOR, USER_ROLES.ADMIN].includes(role)) {
      return NextResponse.json({ error: "Invalid email or role" }, { status: 400 });
    }

    // Generate secure token
    const token = crypto.randomBytes(32).toString("hex");
    const tokenHash = crypto.createHash("sha256").update(token).digest("hex");

    const collection = await getCollection(COLLECTIONS.INVITATIONS);
    
    // Expires in 7 days
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    await collection.insertOne({
      email,
      role,
      tokenHash,
      createdBy: session.user.id,
      createdAt: new Date(),
      expiresAt,
      status: "pending", // pending, accepted, expired
    });

    // In a real app, send email here. For now, we'll return the token link.
    const inviteLink = `${process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"}/invite?token=${token}`;

    return NextResponse.json({ success: true, inviteLink });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Failed to create invitation" }, { status: 500 });
  }
}
