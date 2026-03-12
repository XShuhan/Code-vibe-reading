import { useEffect, useMemo, useRef, useState } from "react";

import type {
  CanvasCardViewModel,
  CanvasNode as CanvasNodeModel,
  CanvasRelation,
  WebviewCanvasState
} from "@code-vibe/shared";
import { canvasRelations } from "@code-vibe/shared";

import { CanvasEdgeRow } from "./CanvasEdge";
import { CanvasNode } from "./CanvasNode";

interface CanvasViewProps {
  state: WebviewCanvasState;
  onMoveNode: (node: CanvasNodeModel) => void;
  onAddNode: (cardId: string) => void;
  onCreateEdge: (
    fromNodeId: string,
    toNodeId: string,
    relation: CanvasRelation
  ) => void;
  onDeleteEdge: (edgeId: string) => void;
  onOpenCard: (cardId: string) => void;
}

interface DragState {
  nodeId: string;
  pointerId: number;
  offsetX: number;
  offsetY: number;
}

export function CanvasView({
  state,
  onMoveNode,
  onAddNode,
  onCreateEdge,
  onDeleteEdge,
  onOpenCard
}: CanvasViewProps) {
  const [localNodes, setLocalNodes] = useState(state.canvas.nodes);
  const [selectedCardId, setSelectedCardId] = useState(
    state.cards.find((item) => !item.node)?.card.id ?? ""
  );
  const [fromNodeId, setFromNodeId] = useState(state.canvas.nodes[0]?.id ?? "");
  const [toNodeId, setToNodeId] = useState(state.canvas.nodes[1]?.id ?? "");
  const [relation, setRelation] = useState<CanvasRelation>("related_to");
  const dragState = useRef<DragState | null>(null);

  useEffect(() => {
    setLocalNodes(state.canvas.nodes);
    setFromNodeId(state.canvas.nodes[0]?.id ?? "");
    setToNodeId(state.canvas.nodes[1]?.id ?? "");
    setSelectedCardId(state.cards.find((item) => !item.node)?.card.id ?? "");
  }, [state.canvas.nodes, state.cards]);

  useEffect(() => {
    const handlePointerMove = (event: PointerEvent) => {
      const drag = dragState.current;
      if (!drag || drag.pointerId !== event.pointerId) {
        return;
      }

      setLocalNodes((current) =>
        current.map((node) =>
          node.id === drag.nodeId
            ? {
                ...node,
                x: Math.max(0, event.clientX - drag.offsetX),
                y: Math.max(0, event.clientY - drag.offsetY)
              }
            : node
        )
      );
    };

    const handlePointerUp = (event: PointerEvent) => {
      const drag = dragState.current;
      if (!drag || drag.pointerId !== event.pointerId) {
        return;
      }

      const node = localNodes.find((item) => item.id === drag.nodeId);
      if (node) {
        onMoveNode(node);
      }
      dragState.current = null;
    };

    window.addEventListener("pointermove", handlePointerMove);
    window.addEventListener("pointerup", handlePointerUp);

    return () => {
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerup", handlePointerUp);
    };
  }, [localNodes, onMoveNode]);

  const itemsByCardId = useMemo(
    () => new Map(state.cards.map((item) => [item.card.id, item])),
    [state.cards]
  );
  const nodeMap = useMemo(
    () => new Map(localNodes.map((node) => [node.id, node])),
    [localNodes]
  );

  const unplacedCards = state.cards.filter((item) => !item.node);

  return (
    <main className="canvas-shell">
      <section className="canvas-stage">
        <div className="canvas-toolbar">
          <h1>Reading Canvas</h1>
          <p className="muted">Organize cards as a reading path, then jump back to the evidence.</p>
        </div>
        <div className="canvas-board">
          {state.cards.map((item) => {
            const localNode = localNodes.find((node) => node.cardId === item.card.id);
            const renderedItem: CanvasCardViewModel = {
              card: item.card,
              node: localNode
            };
            return (
              <CanvasNode
                key={item.card.id}
                item={renderedItem}
                onPointerDown={(event) => {
                  if (!localNode) {
                    return;
                  }
                  dragState.current = {
                    nodeId: localNode.id,
                    pointerId: event.pointerId,
                    offsetX: event.nativeEvent.offsetX,
                    offsetY: event.nativeEvent.offsetY
                  };
                }}
                onOpen={() => onOpenCard(item.card.id)}
              />
            );
          })}
        </div>
      </section>

      <aside className="canvas-sidebar">
        <section className="detail-panel">
          <h2>Add card</h2>
          <div className="field">
            <label htmlFor="add-card-select">Unplaced cards</label>
            <select
              id="add-card-select"
              value={selectedCardId}
              onChange={(event) => setSelectedCardId(event.target.value)}
            >
              <option value="">Select a card</option>
              {unplacedCards.map((item) => (
                <option key={item.card.id} value={item.card.id}>
                  {item.card.title}
                </option>
              ))}
            </select>
          </div>
          <button
            className="primary-button"
            disabled={!selectedCardId}
            onClick={() => {
              onAddNode(selectedCardId);
              setSelectedCardId("");
            }}
          >
            Add to canvas
          </button>
        </section>

        <section className="detail-panel">
          <h2>Connect cards</h2>
          <div className="field">
            <label htmlFor="from-node-select">From</label>
            <select
              id="from-node-select"
              value={fromNodeId}
              onChange={(event) => setFromNodeId(event.target.value)}
            >
              {localNodes.map((node) => {
                const card = itemsByCardId.get(node.cardId)?.card;
                return (
                  <option key={node.id} value={node.id}>
                    {card?.title ?? node.cardId}
                  </option>
                );
              })}
            </select>
          </div>
          <div className="field">
            <label htmlFor="relation-select">Relation</label>
            <select
              id="relation-select"
              value={relation}
              onChange={(event) => setRelation(event.target.value as CanvasRelation)}
            >
              {canvasRelations.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </div>
          <div className="field">
            <label htmlFor="to-node-select">To</label>
            <select
              id="to-node-select"
              value={toNodeId}
              onChange={(event) => setToNodeId(event.target.value)}
            >
              {localNodes.map((node) => {
                const card = itemsByCardId.get(node.cardId)?.card;
                return (
                  <option key={node.id} value={node.id}>
                    {card?.title ?? node.cardId}
                  </option>
                );
              })}
            </select>
          </div>
          <button
            className="primary-button"
            disabled={!fromNodeId || !toNodeId || fromNodeId === toNodeId}
            onClick={() => onCreateEdge(fromNodeId, toNodeId, relation)}
          >
            Create relation
          </button>
        </section>

        <section className="detail-panel">
          <h2>Relations</h2>
          <div className="edge-list">
            {state.canvas.edges.length === 0 ? (
              <p className="muted">No typed relations yet.</p>
            ) : (
              state.canvas.edges.map((edge) => {
                const fromNode = nodeMap.get(edge.fromNodeId);
                const toNode = nodeMap.get(edge.toNodeId);
                const fromCard = fromNode ? itemsByCardId.get(fromNode.cardId)?.card : undefined;
                const toCard = toNode ? itemsByCardId.get(toNode.cardId)?.card : undefined;

                return (
                  <CanvasEdgeRow
                    key={edge.id}
                    edge={edge}
                    fromNode={fromNode}
                    toNode={toNode}
                    fromTitle={fromCard?.title ?? edge.fromNodeId}
                    toTitle={toCard?.title ?? edge.toNodeId}
                    onDelete={() => onDeleteEdge(edge.id)}
                  />
                );
              })
            )}
          </div>
        </section>
      </aside>
    </main>
  );
}

