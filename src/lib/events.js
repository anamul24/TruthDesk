/**
 * Newsroom Realtime Event System
 * Uses Server-Sent Events (SSE) via a module-level EventEmitter.
 * Works within a single Vercel function instance.
 */

import { EventEmitter } from "events";

// Module-level singleton — shared across requests in the same process.
// Use globalThis in Next.js to preserve it across hot reloads in dev mode.
const emitter = globalThis.newsroomEmitter || new EventEmitter();
if (!globalThis.newsroomEmitter) {
  emitter.setMaxListeners(200); // Support many concurrent clients
  globalThis.newsroomEmitter = emitter;
}

export const NEWSROOM_EVENTS = {
  NEW_SUBMISSION: "new_submission",       // journalist submitted article
  ARTICLE_APPROVED: "article_approved",   // editor approved
  ARTICLE_REJECTED: "article_rejected",   // editor rejected
  REVISION_REQUESTED: "revision_requested",
  ARTICLE_PUBLISHED: "article_published",
  ASSIGNMENT_CREATED: "assignment_created",
  PITCH_CREATED: "pitch_created",
  PITCH_UPDATED: "pitch_updated",
  NOTIFICATION_CREATED: "notification_created",
  STATS_UPDATE: "stats_update",
  BREAKING_NEWS: "breaking_news",
};

/**
 * Emit a realtime event to connected SSE clients.
 * @param {string} eventType - One of NEWSROOM_EVENTS
 * @param {object} payload - Event data (must be JSON-serializable)
 * @param {string[]} [targetUserIds] - If provided, only these users receive the event.
 *                                     If empty/undefined, event is broadcast to all roles.
 * @param {string[]} [targetRoles] - Roles that should receive this event (e.g., ['editor', 'admin'])
 */
export function emitNewsroomEvent(eventType, payload, targetUserIds = [], targetRoles = []) {
  emitter.emit("newsroom", {
    type: eventType,
    payload,
    targetUserIds,
    targetRoles,
    timestamp: new Date().toISOString(),
  });
}

/**
 * Subscribe to all newsroom events.
 * @param {function} listener
 */
export function onNewsroomEvent(listener) {
  emitter.on("newsroom", listener);
}

/**
 * Unsubscribe from newsroom events.
 * @param {function} listener
 */
export function offNewsroomEvent(listener) {
  emitter.off("newsroom", listener);
}
