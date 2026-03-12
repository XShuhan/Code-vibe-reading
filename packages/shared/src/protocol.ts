import type {
  CanvasEdge,
  CanvasNode,
  CanvasRelation,
  Citation,
  WebviewState
} from "./types";

export type ExtensionToWebviewMessage =
  | {
      type: "bootstrap";
      payload: WebviewState;
    }
  | {
      type: "canvas.updated";
      payload: WebviewState;
    };

export type WebviewToExtensionMessage =
  | {
      type: "ready";
    }
  | {
      type: "canvas.moveNode";
      payload: Pick<CanvasNode, "id" | "x" | "y" | "width" | "height">;
    }
  | {
      type: "canvas.addNode";
      payload: {
        cardId: string;
      };
    }
  | {
      type: "canvas.createEdge";
      payload: {
        fromNodeId: string;
        toNodeId: string;
        relation: CanvasRelation;
      };
    }
  | {
      type: "canvas.deleteEdge";
      payload: {
        edgeId: string;
      };
    }
  | {
      type: "card.openEvidence";
      payload: Citation;
    }
  | {
      type: "thread.openCitation";
      payload: Citation;
    }
  | {
      type: "canvas.openCard";
      payload: {
        cardId: string;
      };
    };

export const WEBVIEW_PROTOCOL = {
  extensionToWebview: [
    "bootstrap",
    "canvas.updated"
  ] as const,
  webviewToExtension: [
    "ready",
    "canvas.moveNode",
    "canvas.addNode",
    "canvas.createEdge",
    "canvas.deleteEdge",
    "card.openEvidence",
    "thread.openCitation",
    "canvas.openCard"
  ] as const
};

export function cloneCanvasNode(node: CanvasNode): CanvasNode {
  return { ...node };
}

export function cloneCanvasEdge(edge: CanvasEdge): CanvasEdge {
  return { ...edge };
}

