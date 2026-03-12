import type { CanvasCardViewModel } from "@code-vibe/shared";

interface CanvasNodeProps {
  item: CanvasCardViewModel;
  onPointerDown: (event: React.PointerEvent<HTMLButtonElement>) => void;
  onOpen: () => void;
}

export function CanvasNode({ item, onPointerDown, onOpen }: CanvasNodeProps) {
  if (!item.node) {
    return null;
  }

  return (
    <button
      className="canvas-node"
      style={{
        left: item.node.x,
        top: item.node.y,
        width: item.node.width,
        height: item.node.height
      }}
      onPointerDown={onPointerDown}
      onDoubleClick={onOpen}
      onClick={onOpen}
    >
      <span className="canvas-node-type">{item.card.type}</span>
      <strong>{item.card.title}</strong>
      <span className="canvas-node-summary">{item.card.summary.slice(0, 160)}</span>
    </button>
  );
}

