import { NextResponse } from "next/server";

// Routes that require authentication and specific roles
const PROTECTED_ROUTES = {
  "/journalist": ["journalist", "admin"],
  "/editor": ["editor", "admin"],
  "/admin": ["admin"],
};

// Role-based home redirects
const ROLE_REDIRECTS = {
  journalist: "/journalist",
  editor: "/editor",
  admin: "/admin",
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

  // For role-based access, we need to validate the session server-side.
  // We'll call our own API to verify the session and role.
  try {
    const sessionRes = await fetch(
      new URL("/api/auth/get-session", request.url),
      {
        headers: {
          cookie: request.headers.get("cookie") || "",
        },
      }
    );

    if (!sessionRes.ok) {
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("callbackUrl", pathname);
      return NextResponse.redirect(loginUrl);
    }

    const session = await sessionRes.json();
    const userRole = session?.user?.role;

    if (!userRole) {
      return NextResponse.redirect(new URL("/login", request.url));
    }

    // Regular users have no access to newsroom routes → redirect to home
    if (userRole === "user") {
      return NextResponse.redirect(new URL("/", request.url));
    }

    // Check if user's role is allowed for this route
    const allowedRoles = PROTECTED_ROUTES[matchedPrefix];
    if (!allowedRoles.includes(userRole)) {
      // Redirect to their correct dashboard
      const correctPath = ROLE_REDIRECTS[userRole] || "/";
      if (correctPath !== pathname) {
        return NextResponse.redirect(new URL(correctPath, request.url));
      }
      return NextResponse.redirect(new URL("/", request.url));
    }

    return NextResponse.next();
  } catch (error) {
    console.error("Middleware auth check failed:", error);
    return NextResponse.next();
  }
}

export const config = {
  matcher: ["/journalist/:path*", "/editor/:path*", "/admin/:path*"],
};
