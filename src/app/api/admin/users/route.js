import { NextResponse } from "next/server";
import { requireRoleAPI } from "@/lib/authorize";
import { USER_ROLES } from "@/lib/validations";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

// GET /api/admin/users — list all users (admin only)
export async function GET(request) {
  const { session, error } = await requireRoleAPI([USER_ROLES.ADMIN]);
  if (error) return error;

  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get("limit") || "100");
    const offset = parseInt(searchParams.get("offset") || "0");
    const search = searchParams.get("search") || "";

    const result = await auth.api.listUsers({
      query: {
        limit,
        offset,
        searchField: search ? "email" : undefined,
        searchValue: search || undefined,
        sortBy: "createdAt",
        sortDirection: "desc",
      },
      headers: await headers(),
    });

    return NextResponse.json({
      users: result.users || [],
      total: result.total || 0,
    });
  } catch (err) {
    console.error("Failed to list users:", err);
    return NextResponse.json({ error: "Failed to fetch users" }, { status: 500 });
  }
}
