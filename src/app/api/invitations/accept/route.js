import { NextResponse } from "next/server";
import { getCollection, COLLECTIONS } from "@/lib/db";
import { requireAuthAPI } from "@/lib/authorize";
import crypto from "crypto";

export async function POST(request) {
  try {
    const { session, error } = await requireAuthAPI();
    if (error) return error;

    const body = await request.json();
    const { token } = body;

    if (!token) {
      return NextResponse.json({ error: "Missing token" }, { status: 400 });
    }

    const tokenHash = crypto.createHash("sha256").update(token).digest("hex");
    const collection = await getCollection(COLLECTIONS.INVITATIONS);

    const invitation = await collection.findOne({ tokenHash });

    if (!invitation) {
      return NextResponse.json({ error: "Invalid invitation link" }, { status: 400 });
    }

    if (invitation.status !== "pending" || new Date(invitation.expiresAt) < new Date()) {
      return NextResponse.json({ error: "Invitation expired or already used" }, { status: 400 });
    }

    // Ensure email matches (optional security measure, maybe we allow them to accept with any logged in email? 
    // Usually strict is better for professional platforms, but let's allow it if they logged in with the same email).
    if (session.user.email !== invitation.email) {
      return NextResponse.json({ error: "Please log in with the email address the invitation was sent to" }, { status: 403 });
    }

    // Update user role
    const usersCollection = await getCollection("user");
    await usersCollection.updateOne(
      { _id: session.user.id },
      { $set: { role: invitation.role } }
    );

    // Mark invitation as used
    await collection.updateOne(
      { _id: invitation._id },
      { $set: { status: "accepted", acceptedBy: session.user.id, acceptedAt: new Date() } }
    );

    return NextResponse.json({ success: true, role: invitation.role });
  } catch (err) {
    console.error("Accept invite error:", err);
    return NextResponse.json({ error: "Failed to process invitation" }, { status: 500 });
  }
}
