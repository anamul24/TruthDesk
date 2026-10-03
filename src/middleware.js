import { NextResponse } from "next/server";

// Routes that require authentication and specific roles
const PROTECTED_ROUTES = {
  "/journalist": ["journalist", "admin"],
  "/editor": ["editor", "admin", "fact_checker"],
  "/admin": ["admin"],
};

// Role-based home redirects
const ROLE_REDIRECTS = {
  journalist: "/journalist",
  editor: "/editor",
  admin: "/admin",
  fact_checker: "/editor",
};

export async function middleware(request) {
  const { pathname } = request.nextUrl;

  // Check if the path matches any protected route prefix
  const matchedPrefix = Object.keys(PROTECTED_ROUTES).find((prefix) =>
    pathname.startsWith(prefix)
  );

  if (!matchedPrefix) {
    return NextResponse.next();
  }

  // Get session from Better Auth cookie
  // We use the Better Auth session cookie to check authentication
  const sessionCookie =
    request.cookies.get("better-auth.session_token")?.value ||
    request.cookies.get("__Secure-better-auth.session_token")?.value;

  if (!sessionCookie) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // We rely on Next.js server components (layouts/pages) to verify roles and the actual session.
  // This prevents extremely slow navigation delays caused by making HTTP fetch calls on every client-side navigation.
  return NextResponse.next();
}

export const config = {
  matcher: ["/journalist/:path*", "/editor/:path*", "/admin/:path*"],
};
