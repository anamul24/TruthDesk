"use client";

import { useEffect } from "react";

/**
 * ArticleViewTracker — client component that fires a view count API call on mount.
 * Uses sessionStorage to store a session ID (randomly generated per browser session).
 * The server-side DB enforces dedup via unique index on (articleId, sessionId).
 */
export default function ArticleViewTracker({ articleId }) {
  useEffect(() => {
    if (!articleId) return;

    // Get or create a session ID for this browser session
    let sessionId = sessionStorage.getItem("td_session_id");
    if (!sessionId) {
      sessionId = `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
      sessionStorage.setItem("td_session_id", sessionId);
    }

    // Fire view event (fire-and-forget)
    fetch(`/api/articles/${articleId}/view`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sessionId }),
    }).catch(() => {}); // Silently fail — views are best-effort
  }, [articleId]);

  return null; // Invisible component
}
