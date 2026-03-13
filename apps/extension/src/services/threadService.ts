import * as vscode from "vscode";

import { buildSelectionQuestionContext } from "@code-vibe/retrieval";
import { answerGroundedQuestion } from "@code-vibe/model-gateway";
import type { Thread, ThreadMessage, WorkspaceIndex } from "@code-vibe/shared";
import { createId, nowIso } from "@code-vibe/shared";

import type { PersistenceLayer } from "@code-vibe/persistence";

import { assertModelConfigured } from "../config/settings";
import type { IndexService } from "./indexService";

export class ThreadService {
  private threads: Thread[] = [];
  private readonly emitter = new vscode.EventEmitter<void>();

  readonly onDidChange = this.emitter.event;

  constructor(
    private readonly persistence: PersistenceLayer,
    private readonly indexService: IndexService,
    private readonly output: vscode.OutputChannel
  ) {}

  async initialize(): Promise<void> {
    this.threads = await this.persistence.loadThreads();
    this.emitter.fire();
  }

  getThreads(): Thread[] {
    return [...this.threads].sort((left, right) => right.updatedAt.localeCompare(left.updatedAt));
  }

  getThread(threadId: string): Thread | undefined {
    return this.threads.find((thread) => thread.id === threadId);
  }

  async askQuestion(
    question: string,
    editorState: NonNullable<ReturnType<typeof import("../editor/selectionContext").getActiveSelectionState>>,
    modelConfig: ReturnType<typeof import("../config/settings").getModelConfig>
  ): Promise<Thread> {
    assertModelConfigured(modelConfig);

    const index = await this.indexService.ensureIndex();
    const { context, evidence } = buildSelectionQuestionContext(index, editorState, question);
    this.output.appendLine(`[retrieval] evidence_count=${evidence.length}`);

    const answer = await answerGroundedQuestion(modelConfig, context, evidence);
    const title = deriveThreadTitle(question, editorState.activeFile);
    const createdAt = nowIso();
    const thread: Thread = {
      id: createId("thread"),
      workspaceId: index.snapshot.id,
      title,
      createdAt,
      updatedAt: createdAt,
      contextRefs: [editorState.activeFile, ...answer.citations.map((citation) => citation.label)],
      messages: [
        {
          id: createId("message"),
          role: "user",
          content: question,
          citations: [],
          createdAt
        },
        {
          id: createId("message"),
          role: "assistant",
          content: answer.answerMarkdown,
          citations: answer.citations,
          createdAt
        }
      ]
    };

    this.threads = [thread, ...this.threads];
    await this.persistence.saveThreads(this.threads);
    this.emitter.fire();
    return thread;
  }

  getLatestAssistantMessage(threadId: string): ThreadMessage | undefined {
    return this.getThread(threadId)?.messages.findLast((message: ThreadMessage) => message.role === "assistant");
  }
}

function deriveThreadTitle(question: string, filePath: string): string {
  const trimmed = question.trim();
  if (trimmed.length > 0) {
    return trimmed.length > 72 ? `${trimmed.slice(0, 69)}...` : trimmed;
  }

  return `Explain ${filePath}`;
}
