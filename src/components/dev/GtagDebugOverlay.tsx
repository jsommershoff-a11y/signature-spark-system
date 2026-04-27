import { useEffect, useState } from "react";

interface ConversionEvent {
  id: string;
  timestamp: number;
  payload: Record<string, unknown>;
}

const MAX_EVENTS = 20;

/**
 * Dev-only overlay that intercepts gtag('event', 'conversion', …) calls
 * and shows them live in the bottom-right corner.
 * Renders nothing in production builds.
 */
export function GtagDebugOverlay() {
  const [events, setEvents] = useState<ConversionEvent[]>([]);
  const [collapsed, setCollapsed] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;

    // Wait until gtag is defined, then patch it. Re-check briefly because
    // gtag.js loads async via the <script> tag in index.html.
    let cancelled = false;
    let originalGtag: ((...args: unknown[]) => void) | undefined;

    const patch = () => {
      if (cancelled) return;
      const g = window.gtag;
      if (typeof g !== "function") {
        // Try again shortly
        window.setTimeout(patch, 200);
        return;
      }
      if ((g as unknown as { __krsPatched?: boolean }).__krsPatched) return;

      originalGtag = g;
      const wrapped = ((...args: unknown[]) => {
        try {
          if (
            args[0] === "event" &&
            args[1] === "conversion" &&
            typeof args[2] === "object" &&
            args[2] !== null
          ) {
            const payload = args[2] as Record<string, unknown>;
            const evt: ConversionEvent = {
              id: `${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
              timestamp: Date.now(),
              payload,
            };
            setEvents((prev) => [evt, ...prev].slice(0, MAX_EVENTS));
            // Also log to console for stack-trace context
            // eslint-disable-next-line no-console
            console.info("[gtag conversion]", payload);
          }
        } catch {
          /* never break gtag */
        }
        return originalGtag!.apply(window, args);
      }) as typeof window.gtag;

      (wrapped as unknown as { __krsPatched: boolean }).__krsPatched = true;
      window.gtag = wrapped;
    };

    patch();

    return () => {
      cancelled = true;
      // Best-effort restore
      if (originalGtag && window.gtag && (window.gtag as unknown as { __krsPatched?: boolean }).__krsPatched) {
        window.gtag = originalGtag;
      }
    };
  }, []);

  const fmtTime = (ts: number) =>
    new Date(ts).toLocaleTimeString("de-DE", { hour12: false }) +
    "." +
    String(ts % 1000).padStart(3, "0");

  return (
    <div
      style={{
        position: "fixed",
        bottom: 12,
        right: 12,
        zIndex: 99999,
        width: collapsed ? "auto" : 360,
        maxHeight: "60vh",
        background: "rgba(15, 23, 42, 0.95)",
        color: "#f1f5f9",
        border: "1px solid #334155",
        borderRadius: 8,
        fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace",
        fontSize: 11,
        boxShadow: "0 10px 30px rgba(0,0,0,0.4)",
        overflow: "hidden",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "6px 10px",
          background: "#1e293b",
          borderBottom: collapsed ? "none" : "1px solid #334155",
          cursor: "pointer",
          userSelect: "none",
        }}
        onClick={() => setCollapsed((c) => !c)}
      >
        <span style={{ fontWeight: 600 }}>
          🎯 gtag conversions{" "}
          <span style={{ color: "#94a3b8" }}>({events.length})</span>
        </span>
        <span style={{ display: "flex", gap: 8 }}>
          {!collapsed && events.length > 0 && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setEvents([]);
              }}
              style={{
                background: "transparent",
                color: "#94a3b8",
                border: "1px solid #334155",
                borderRadius: 4,
                padding: "1px 6px",
                cursor: "pointer",
                fontSize: 10,
              }}
            >
              clear
            </button>
          )}
          <span style={{ color: "#94a3b8" }}>{collapsed ? "▲" : "▼"}</span>
        </span>
      </div>

      {!collapsed && (
        <div style={{ overflowY: "auto", maxHeight: "calc(60vh - 32px)" }}>
          {events.length === 0 ? (
            <div style={{ padding: 12, color: "#94a3b8" }}>
              Keine conversion-Events bisher. Sende ein Formular, um sie hier zu
              sehen.
            </div>
          ) : (
            events.map((evt) => (
              <div
                key={evt.id}
                style={{
                  padding: "8px 10px",
                  borderBottom: "1px solid #1e293b",
                }}
              >
                <div style={{ color: "#fbbf24", marginBottom: 4 }}>
                  {fmtTime(evt.timestamp)}
                </div>
                <pre
                  style={{
                    margin: 0,
                    whiteSpace: "pre-wrap",
                    wordBreak: "break-all",
                    color: "#e2e8f0",
                  }}
                >
                  {JSON.stringify(evt.payload, null, 2)}
                </pre>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
