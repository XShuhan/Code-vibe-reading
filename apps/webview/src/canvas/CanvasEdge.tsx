import type { CanvasEdge, CanvasNode as CanvasNodeModel } from "@code-vibe/shared";

interface CanvasEdgeProps {
  edge: CanvasEdge;
  fromNode?: CanvasNodeModel;
  toNode?: CanvasNodeModel;
  fromTitle: string;
  toTitle: string;
  onDelete: () => void;
}

export function CanvasEdgeRow({
  edge,
  fromNode,
  toNode,
  fromTitle,
  toTitle,
  onDelete
}: CanvasEdgeProps) {
  return (
    <div className="edge-row">
      <div>
        <strong>{fromTitle}</strong> <span className="muted">({fromNode?.x ?? 0}, {fromNode?.y ?? 0})</span>
      </div>
      <div className="edge-relation">{edge.relation}</div>
      <div>
        <strong>{toTitle}</strong> <span className="muted">({toNode?.x ?? 0}, {toNode?.y ?? 0})</span>
      </div>
      <button className="ghost-button" onClick={onDelete}>
        Remove
      </button>
    </div>
  );
}

