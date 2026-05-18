import { useEffect, useRef } from "react";
import { API_URL } from "@/environment";

const WS_PATH = "/assets/ws";

function getWebSocketUrl(): string {
  const base = API_URL.replace(/^http/, "ws").replace(/\/?$/, "");
  let url = `${base}${WS_PATH}`;
  // WebSocket API cannot set Authorization header; pass token as query param for auth layers
  try {
    const authState = JSON.parse(localStorage.getItem("persist:root") || "{}");
    const auth = JSON.parse(authState.auth || "{}");
    const token = auth?.token;
    if (token) {
      url += (url.includes("?") ? "&" : "?") + `token=${encodeURIComponent(token)}`;
    }
  } catch {
    // Ignore parse errors
  }
  return url;
}

/**
 * Subscribe to real-time asset status updates via WebSocket.
 * When the backend publishes an asset_status event (e.g. after detection/c2pa/consent/suitability/policy complete),
 * onStatusUpdate is called so the consumer can refetch the assets list.
 */
export function useAssetStatusWebSocket(onStatusUpdate: () => void): void {
  const onStatusUpdateRef = useRef(onStatusUpdate);
  onStatusUpdateRef.current = onStatusUpdate;

  useEffect(() => {
    const url = getWebSocketUrl();
    let ws: WebSocket | null = null;
    let reconnectTimeout: ReturnType<typeof setTimeout>;
    let cancelled = false;

    function connect() {
      if (cancelled) return;
      try {
        ws = new WebSocket(url);
        ws.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);
            if (data?.event === "asset_status") {
              onStatusUpdateRef.current();
            }
          } catch {
            // ignore non-JSON or parse errors
          }
        };
        ws.onclose = () => {
          ws = null;
          if (!cancelled) reconnectTimeout = setTimeout(connect, 3000);
        };
        ws.onerror = () => {
          // onclose will run after error
        };
      } catch (err) {
        if (!cancelled) reconnectTimeout = setTimeout(connect, 3000);
      }
    }

    connect();

    return () => {
      cancelled = true;
      clearTimeout(reconnectTimeout);
      if (ws) {
        ws.close();
        ws = null;
      }
    };
  }, []);
}
