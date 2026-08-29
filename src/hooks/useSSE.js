"use client";

import { useEffect, useRef, useCallback } from "react";

/**
 * useSSE — Subscribe to Server-Sent Events from /api/sse/events
 *
 * @param {function} onEvent - Callback called with { type, payload, timestamp }
 * @param {string[]} [eventTypes] - Optional filter: only call onEvent for these types
 */
export function useSSE(onEvent, eventTypes = []) {
  const onEventRef = useRef(onEvent);
  const eventTypesRef = useRef(eventTypes);
  const esRef = useRef(null);
  const reconnectTimerRef = useRef(null);

  useEffect(() => {
    onEventRef.current = onEvent;
    eventTypesRef.current = eventTypes;
  });

  const connect = useCallback(() => {
    if (esRef.current) {
      esRef.current.close();
    }

    const es = new EventSource("/api/sse/events");
    esRef.current = es;

    es.onmessage = (e) => {
      try {
        const event = JSON.parse(e.data);
        if (event.type === "connected") return; // Skip connection ack

        const types = eventTypesRef.current;
        if (types.length === 0 || types.includes(event.type)) {
          onEventRef.current(event);
        }
      } catch {
        // Ignore parse errors
      }
    };

    es.onerror = () => {
      es.close();
      esRef.current = null;
      // Reconnect after 5s
      reconnectTimerRef.current = setTimeout(connect, 5000);
    };
  }, []);

  useEffect(() => {
    connect();

    return () => {
      clearTimeout(reconnectTimerRef.current);
      if (esRef.current) {
        esRef.current.close();
        esRef.current = null;
      }
    };
  }, [connect]);
}
