import { NextResponse } from "next/server";
import { requireAuthAPI } from "@/lib/authorize";
import { onNewsroomEvent, offNewsroomEvent } from "@/lib/events";

export const dynamic = "force-dynamic";
export const runtime = "nodejs"; // EventEmitter requires Node.js runtime

/**
 * GET /api/sse/events
 * Server-Sent Events endpoint for realtime newsroom updates.
 * Clients subscribe and receive events filtered by their role/userId.
 */
export async function GET(request) {
  const { session, error } = await requireAuthAPI();
  if (error) return error;

  const user = session.user;

  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    start(controller) {
      // Send initial connection confirmation
      const connectMsg = `data: ${JSON.stringify({ type: "connected", userId: user.id, role: user.role })}\n\n`;
      controller.enqueue(encoder.encode(connectMsg));

      // Heartbeat every 25s to keep connection alive (Vercel 60s timeout buffer)
      const heartbeat = setInterval(() => {
        try {
          controller.enqueue(encoder.encode(": heartbeat\n\n"));
        } catch {
          clearInterval(heartbeat);
        }
      }, 25000);

      // Listen for newsroom events
      const listener = (event) => {
        try {
          const { type, payload, targetUserIds, targetRoles, timestamp } = event;

          // Check if this user should receive the event
          const isTargetUser =
            targetUserIds.length === 0 || targetUserIds.includes(user.id);
          const isTargetRole =
            targetRoles.length === 0 || targetRoles.includes(user.role);

          if (!isTargetUser && !isTargetRole) return;

          const msg = `data: ${JSON.stringify({ type, payload, timestamp })}\n\n`;
          controller.enqueue(encoder.encode(msg));
        } catch {
          // Client disconnected
        }
      };

      onNewsroomEvent(listener);

      // Cleanup on stream close
      request.signal.addEventListener("abort", () => {
        clearInterval(heartbeat);
        offNewsroomEvent(listener);
        try { controller.close(); } catch { /* already closed */ }
      });
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      "Connection": "keep-alive",
      "X-Accel-Buffering": "no", // Disable nginx buffering
    },
  });
}
