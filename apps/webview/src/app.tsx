import type { WebviewState } from "@code-vibe/shared";

import { CardDetail } from "./cards/CardDetail";
import { CanvasView } from "./canvas/CanvasView";
import { ThreadDetail } from "./threads/ThreadDetail";
import { vscodeApi } from "./shared/vscodeApi";

export function App({ state }: { state: WebviewState }) {
  if (state.kind === "thread") {
    return (
      <ThreadDetail
        state={state}
        onOpenCitation={(citation) =>
          vscodeApi.postMessage({ type: "thread.openCitation", payload: citation })
        }
      />
    );
  }

  if (state.kind === "card") {
    return (
      <CardDetail
        state={state}
        onOpenEvidence={(citation) =>
          vscodeApi.postMessage({ type: "card.openEvidence", payload: citation })
        }
      />
    );
  }

  return (
    <CanvasView
      state={state}
      onMoveNode={(node) =>
        vscodeApi.postMessage({ type: "canvas.moveNode", payload: node })
      }
      onAddNode={(cardId) =>
        vscodeApi.postMessage({ type: "canvas.addNode", payload: { cardId } })
      }
      onCreateEdge={(fromNodeId, toNodeId, relation) =>
        vscodeApi.postMessage({
          type: "canvas.createEdge",
          payload: { fromNodeId, toNodeId, relation }
        })
      }
      onDeleteEdge={(edgeId) =>
        vscodeApi.postMessage({ type: "canvas.deleteEdge", payload: { edgeId } })
      }
      onOpenCard={(cardId) =>
        vscodeApi.postMessage({ type: "canvas.openCard", payload: { cardId } })
      }
    />
  );
}

