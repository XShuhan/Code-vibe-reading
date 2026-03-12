import * as vscode from "vscode";

import type { CanvasRelation, CanvasState } from "@code-vibe/shared";
import { createId, nowIso } from "@code-vibe/shared";

import type { PersistenceLayer } from "@code-vibe/persistence";

import type { CardService } from "./cardService";
import type { IndexService } from "./indexService";

export class CanvasService {
  private canvas: CanvasState | null = null;
  private readonly emitter = new vscode.EventEmitter<void>();

  readonly onDidChange = this.emitter.event;

  constructor(
    private readonly persistence: PersistenceLayer,
    private readonly indexService: IndexService,
    private readonly cardService: CardService
  ) {}

  async initialize(): Promise<void> {
    this.canvas = await this.persistence.loadCanvas();
    this.emitter.fire();
  }

  async getCanvas(): Promise<CanvasState> {
    if (this.canvas) {
      return this.canvas;
    }

    this.canvas = await this.persistence.loadCanvas();
    return this.canvas;
  }

  async addCard(cardId: string): Promise<void> {
    const canvas = await this.getCanvas();
    if (canvas.nodes.some((node) => node.cardId === cardId)) {
      return;
    }

    const position = canvas.nodes.length;
    canvas.nodes.push({
      id: createId("canvas_node"),
      cardId,
      x: 40 + (position % 3) * 280,
      y: 40 + Math.floor(position / 3) * 220,
      width: 240,
      height: 180
    });
    await this.persist(canvas);
  }

  async moveNode(
    nodeId: string,
    x: number,
    y: number,
    width: number,
    height: number
  ): Promise<void> {
    const canvas = await this.getCanvas();
    const node = canvas.nodes.find((entry) => entry.id === nodeId);
    if (!node) {
      return;
    }

    node.x = x;
    node.y = y;
    node.width = width;
    node.height = height;
    await this.persist(canvas);
  }

  async createEdge(fromNodeId: string, toNodeId: string, relation: CanvasRelation): Promise<void> {
    const canvas = await this.getCanvas();
    const duplicate = canvas.edges.some(
      (edge) =>
        edge.fromNodeId === fromNodeId &&
        edge.toNodeId === toNodeId &&
        edge.relation === relation
    );
    if (duplicate) {
      return;
    }

    canvas.edges.push({
      id: createId("canvas_edge"),
      fromNodeId,
      toNodeId,
      relation
    });
    await this.persist(canvas);
  }

  async removeEdge(edgeId: string): Promise<void> {
    const canvas = await this.getCanvas();
    canvas.edges = canvas.edges.filter((edge) => edge.id !== edgeId);
    await this.persist(canvas);
  }

  async addThreadAnswerToCanvas(threadId: string): Promise<string> {
    const cards = this.cardService.getCards();
    const existing = cards.find((card) => card.sourceThreadId === threadId);
    const card =
      existing ??
      (await this.cardService.createCardFromThread(
        (() => {
          throw new Error("Thread resolution must be handled by the caller.");
        })()
      ));
    await this.addCard(card.id);
    return card.id;
  }

  private async persist(canvas: CanvasState): Promise<void> {
    canvas.updatedAt = nowIso();
    this.canvas = canvas;
    await this.persistence.saveCanvas(canvas);
    this.emitter.fire();
  }
}

