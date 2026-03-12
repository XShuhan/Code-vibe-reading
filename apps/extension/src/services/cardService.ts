import * as vscode from "vscode";

import { traceCallPath } from "@code-vibe/analyzer";
import type { Card, EditorSelectionState, Thread, TracePathResult, WorkspaceIndex, ThreadMessage } from "@code-vibe/shared";
import { createId, nowIso } from "@code-vibe/shared";

import type { PersistenceLayer } from "@code-vibe/persistence";

import type { IndexService } from "./indexService";

export class CardService {
  private cards: Card[] = [];
  private readonly emitter = new vscode.EventEmitter<void>();

  readonly onDidChange = this.emitter.event;

  constructor(
    private readonly persistence: PersistenceLayer,
    private readonly indexService: IndexService
  ) {}

  async initialize(): Promise<void> {
    this.cards = await this.persistence.loadCards();
    this.emitter.fire();
  }

  getCards(): Card[] {
    return [...this.cards].sort((left, right) => right.updatedAt.localeCompare(left.updatedAt));
  }

  getCard(cardId: string): Card | undefined {
    return this.cards.find((card) => card.id === cardId);
  }

  async createCardFromSelection(
    editorState: EditorSelectionState,
    title: string | undefined,
    type: Card["type"] = "SymbolCard"
  ): Promise<Card> {
    const index = await this.indexService.ensureIndex();
    const node =
      editorState.currentSymbolId
        ? index.nodes.find((entry) => entry.id === editorState.currentSymbolId)
        : this.indexService.getNodeByLocation(editorState.activeFile, editorState.startLine);
    const cardTitle = title?.trim() || node?.name || `${type} ${editorState.activeFile}:${editorState.startLine}`;
    const summary = summarizeSelection(editorState.selectedText);
    const citation = {
      id: createId("citation"),
      path: editorState.activeFile,
      startLine: editorState.startLine,
      endLine: editorState.endLine,
      symbolId: node?.id,
      label: `${editorState.activeFile}:${editorState.startLine}-${editorState.endLine}`
    };
    const now = nowIso();

    const card: Card = {
      id: createId("card"),
      workspaceId: index.snapshot.id,
      type,
      title: cardTitle,
      summary,
      evidenceRefs: [citation],
      tags: extractTags(editorState.activeFile, node?.name),
      createdAt: now,
      updatedAt: now
    };

    await this.upsert(card);
    return card;
  }

  async createCardFromThread(thread: Thread): Promise<Card> {
    const latestAssistantMessage = thread.messages.findLast((message: ThreadMessage) => message.role === "assistant");
    if (!latestAssistantMessage) {
      throw new Error("The selected thread has no assistant answer to save.");
    }

    const now = nowIso();
    const card: Card = {
      id: createId("card"),
      workspaceId: thread.workspaceId,
      type: "ConceptCard",
      title: thread.title,
      summary: latestAssistantMessage.content,
      evidenceRefs: latestAssistantMessage.citations,
      sourceThreadId: thread.id,
      tags: ["thread-derived"],
      createdAt: now,
      updatedAt: now
    };

    await this.upsert(card);
    return card;
  }

  async createTraceCard(nodeId: string): Promise<Card> {
    const index = await this.indexService.ensureIndex();
    const node = index.nodes.find((entry) => entry.id === nodeId);
    if (!node) {
      throw new Error("Could not find the active symbol in the current index.");
    }

    const trace = traceCallPath(index, nodeId);
    const now = nowIso();
    const card: Card = {
      id: createId("card"),
      workspaceId: index.snapshot.id,
      type: "FlowCard",
      title: `Trace: ${node.name}`,
      summary: summarizeTrace(index, trace, node.name),
      evidenceRefs: [
        {
          id: createId("citation"),
          path: node.path,
          startLine: node.rangeStartLine,
          endLine: node.rangeEndLine,
          symbolId: node.id,
          label: `${node.path}:${node.rangeStartLine}-${node.rangeEndLine}`
        }
      ],
      tags: ["trace", node.kind],
      createdAt: now,
      updatedAt: now
    };

    await this.upsert(card);
    return card;
  }

  private async upsert(card: Card): Promise<void> {
    this.cards = [card, ...this.cards.filter((existing) => existing.id !== card.id)];
    await this.persistence.saveCards(this.cards);
    this.emitter.fire();
  }
}

function summarizeSelection(selectedText: string): string {
  const normalized = selectedText.trim();
  if (!normalized) {
    return "Captured from the current editor selection.";
  }

  const lines = normalized.split(/\r?\n/);
  const preview = lines.slice(0, 6).join("\n");
  return lines.length > 6 ? `${preview}\n...` : preview;
}

function extractTags(filePath: string, symbolName?: string): string[] {
  const base = filePath.split("/").at(-1)?.replace(/\.[^.]+$/, "") ?? "file";
  return [base, ...(symbolName ? [symbolName] : [])];
}

function summarizeTrace(index: WorkspaceIndex, trace: TracePathResult, nodeName: string): string {
  const nodeMap = new Map(index.nodes.map((node) => [node.id, node]));

  const callers = trace.callers
    .map((edge) => {
      const caller = nodeMap.get(edge.fromNodeId);
      return caller ? `- ${caller.name} (${caller.path})${edge.inferred ? " [inferred]" : ""}` : undefined;
    })
    .filter(Boolean);

  const callees = trace.callees
    .map((edge) => {
      const callee = nodeMap.get(edge.toNodeId);
      return callee ? `- ${callee.name} (${callee.path})${edge.inferred ? " [inferred]" : ""}` : undefined;
    })
    .filter(Boolean);

  const neighbors = trace.neighbors
    .map((edge) => {
      const neighbor = nodeMap.get(edge.fromNodeId === trace.anchorNodeId ? edge.toNodeId : edge.fromNodeId);
      return neighbor ? `- ${edge.type}: ${neighbor.name} (${neighbor.path})` : undefined;
    })
    .filter(Boolean);

  return [
    `Observed flow for ${nodeName}`,
    "",
    "Confirmed callers",
    callers.length > 0 ? callers.join("\n") : "- None found in the current index.",
    "",
    "Confirmed callees",
    callees.length > 0 ? callees.join("\n") : "- None found in the current index.",
    "",
    "Structural neighbors",
    neighbors.length > 0 ? neighbors.join("\n") : "- No neighboring import or containment edges were found.",
    "",
    "Inference note",
    "- Call edges marked [inferred] came from best-effort name resolution and should be verified in source."
  ].join("\n");
}

