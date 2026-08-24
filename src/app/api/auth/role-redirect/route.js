import { NextResponse } from "next/server";
import { getSession } from "@/lib/authorize";

/**
 * Server-side role-based redirect after login (especially Google OAuth).
 * Called as callbackURL after social login.
 * Reads the actual role from DB session and redirects to the right place.
 */
export async function GET(request) {
  const session = await getSession();

  if (!session?.user) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  const role = session.user.role;
  const url = new URL(request.url);

  // Check if a specific role was expected (e.g., from journalist/login or editor/login)
  const expectedRole = url.searchParams.get("role");

  if (expectedRole && role !== expectedRole) {
    // User logged in but has wrong role for the page they tried to access
    return NextResponse.redirect(
      new URL(`/access-denied?expected=${expectedRole}&got=${role}`, request.url)
    );
  }

  // Redirect based on actual role
  if (role === "editor") return NextResponse.redirect(new URL("/editor", request.url));
  if (role === "admin") return NextResponse.redirect(new URL("/admin", request.url));
  if (role === "journalist") return NextResponse.redirect(new URL("/journalist", request.url));

  // Default: regular user → home
  return NextResponse.redirect(new URL("/", request.url));
}
