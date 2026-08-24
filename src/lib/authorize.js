import { auth } from "./auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { USER_ROLES } from "./validations";

/**
 * Get the current session on the server side.
 * Returns null if not authenticated.
 */
export async function getSession() {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });
    return session;
  } catch {
    return null;
  }
}

/**
 * Require authentication. Redirects to /login if not authenticated.
 * Returns the session.
 */
export async function requireAuth() {
  const session = await getSession();
  if (!session) {
    redirect("/login");
  }
  return session;
}

/**
 * Require a specific role. Redirects if not authorized.
 * @param {string|string[]} roles - Required role(s)
 */
export async function requireRole(roles) {
  const session = await requireAuth();
  const userRole = session.user?.role;

  const allowedRoles = Array.isArray(roles) ? roles : [roles];

  if (!userRole || !allowedRoles.includes(userRole)) {
    // Redirect to appropriate dashboard based on actual role
    if (userRole === USER_ROLES.JOURNALIST) redirect("/journalist");
    if (userRole === USER_ROLES.EDITOR) redirect("/editor");
    if (userRole === USER_ROLES.ADMIN) redirect("/admin");
    // Regular users and unauthenticated → home
    redirect("/");
  }

  return session;
}


/**
 * Require authentication for API routes.
 * Returns { session, error } - error is a Response if not authenticated.
 */
export async function requireAuthAPI() {
  const session = await getSession();
  if (!session) {
    return {
      session: null,
      error: Response.json({ error: "Unauthorized" }, { status: 401 }),
    };
  }
  return { session, error: null };
}

/**
 * Require a specific role for API routes.
 * Returns { session, error } - error is a Response if not authorized.
 */
export async function requireRoleAPI(roles) {
  const { session, error } = await requireAuthAPI();
  if (error) return { session: null, error };

  const userRole = session.user?.role;
  const allowedRoles = Array.isArray(roles) ? roles : [roles];

  if (!userRole || !allowedRoles.includes(userRole)) {
    return {
      session: null,
      error: Response.json({ error: "Forbidden" }, { status: 403 }),
    };
  }

  return { session, error: null };
}

/**
 * Get the user's role from session
 */
export function getUserRole(session) {
  return session?.user?.role || null;
}

/**
 * Check if user has a specific role
 */
export function hasRole(session, role) {
  return getUserRole(session) === role;
}
