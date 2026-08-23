import { NextResponse } from "next/server";
import { requireRoleAPI } from "@/lib/authorize";
import { USER_ROLES } from "@/lib/validations";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

// PATCH /api/admin/users/[id] — update user role or ban (admin only)
export async function PATCH(request, { params }) {
  const { session, error } = await requireRoleAPI([USER_ROLES.ADMIN]);
  if (error) return error;

  try {
    const { id } = await params;
    const body = await request.json();
    const { role, action } = body;

    // Prevent admin from demoting themselves
    if (id === session.user.id && role && role !== USER_ROLES.ADMIN) {
      return NextResponse.json(
        { error: "You cannot change your own role" },
        { status: 400 }
      );
    }

    if (action === "setRole" && role) {
      const validRoles = Object.values(USER_ROLES);
      if (!validRoles.includes(role)) {
        return NextResponse.json({ error: "Invalid role" }, { status: 400 });
      }

      await auth.api.setRole({
        body: { userId: id, role },
        headers: await headers(),
      });

      return NextResponse.json({ success: true, message: `Role updated to ${role}` });
    }

    if (action === "banUser") {
      await auth.api.banUser({
        body: { userId: id },
        headers: await headers(),
      });
      return NextResponse.json({ success: true, message: "User banned" });
    }

    if (action === "unbanUser") {
      await auth.api.unbanUser({
        body: { userId: id },
        headers: await headers(),
      });
      return NextResponse.json({ success: true, message: "User unbanned" });
    }

    return NextResponse.json({ error: "Unknown action" }, { status: 400 });
  } catch (err) {
    console.error("Failed to update user:", err);
    return NextResponse.json({ error: "Failed to update user" }, { status: 500 });
  }
}
