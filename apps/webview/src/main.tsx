import React, { useEffect, useState } from "react";
import { createRoot } from "react-dom/client";

import type { ExtensionToWebviewMessage, WebviewState } from "@code-vibe/shared";

import { App } from "./app";
import { vscodeApi } from "./shared/vscodeApi";
import "./styles.css";

declare global {
  interface Window {
    __VIBE_STATE__: WebviewState;
  }
}

function Root() {
  const [state, setState] = useState<WebviewState>(window.__VIBE_STATE__);

  useEffect(() => {
    const handleMessage = (event: MessageEvent<ExtensionToWebviewMessage>) => {
      const message = event.data;
      switch (message.type) {
        case "bootstrap":
          setState(message.payload);
          break;
        case "canvas.updated":
          setState(message.payload);
          break;
        default:
          // Unknown message type, ignore
          break;
      }
    };

    window.addEventListener("message", handleMessage);
    
    // Notify extension that webview is ready
    vscodeApi.postMessage({ type: "ready" });

    return () => {
      window.removeEventListener("message", handleMessage);
    };
  }, []);

  return <App state={state} />;
}

const container = document.getElementById("root");
if (!container) {
  throw new Error("Missing root element");
}

createRoot(container).render(
  <React.StrictMode>
    <Root />
  </React.StrictMode>
);

