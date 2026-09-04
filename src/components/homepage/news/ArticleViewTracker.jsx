"use client";

import { useEffect } from "react";

/**
 * ArticleViewTracker — client component that fires a view count API call on mount.
 * Uses localStorage to store a persistent visitor ID for unique daily tracking.
 */
export default function ArticleViewTracker({ articleId }) {
  useEffect(() => {
    if (!articleId) return;

    // Get or create a persistent visitor ID for this browser
    let visitorId = localStorage.getItem("td_visitor_id");
    if (!visitorId) {
      visitorId = `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
      localStorage.setItem("td_visitor_id", visitorId);
    }

    // Fire view event (fire-and-forget)
    fetch(`/api/articles/${articleId}/view`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ visitorId }),
    }).catch(() => {}); // Silently fail — views are best-effort
  }, [articleId]);

  return null; // Invisible component
}
