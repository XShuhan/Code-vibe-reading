import * as vscode from "vscode";

import { getNodeByLocation, indexWorkspace, refreshFiles } from "@code-vibe/analyzer";
import type { CodeNode, WorkspaceIndex } from "@code-vibe/shared";

import type { PersistenceLayer } from "@code-vibe/persistence";

export class IndexService {
  private index: WorkspaceIndex | null = null;
  private readonly emitter = new vscode.EventEmitter<void>();
  private refreshInFlight: Promise<WorkspaceIndex> | null = null;

  readonly onDidChange = this.emitter.event;

  constructor(
    private readonly rootPath: string,
    private readonly persistence: PersistenceLayer,
    private readonly output: vscode.OutputChannel
  ) {}

  async initialize(): Promise<void> {
    const persisted = await this.persistence.loadIndex();
    if (persisted?.snapshot.rootUri === this.rootPath) {
      this.index = persisted;
      this.emitter.fire();
    }

    await this.refresh("startup");
  }

  getIndex(): WorkspaceIndex | null {
    return this.index;
  }

  getWorkspaceId(): string {
    return this.index?.snapshot.id ?? `workspace_${hashText(this.rootPath)}`;
  }

  getRootPath(): string {
    return this.rootPath;
  }

  async ensureIndex(): Promise<WorkspaceIndex> {
    if (this.index) {
      return this.index;
    }

    return this.refresh("lazy");
  }

  async refresh(reason: string): Promise<WorkspaceIndex> {
    if (this.refreshInFlight) {
      return this.refreshInFlight;
    }

    this.output.appendLine(`[index] start reason=${reason}`);
    this.refreshInFlight = indexWorkspace(this.rootPath)
      .then(async (index) => {
        this.index = index;
        await this.persistence.saveIndex(index);
        this.output.appendLine(
          `[index] end files=${Object.keys(index.fileContents).length} nodes=${index.nodes.length} edges=${index.edges.length}`
        );
        this.emitter.fire();
        return index;
      })
      .finally(() => {
        this.refreshInFlight = null;
      });

    return this.refreshInFlight;
  }

  async refreshFile(uri: vscode.Uri): Promise<void> {
    if (!isIndexableFile(uri.fsPath)) {
      return;
    }

    this.output.appendLine(`[index] refresh save=${uri.fsPath}`);
    const index = await refreshFiles(this.rootPath, [uri.fsPath]);
    this.index = index;
    await this.persistence.saveIndex(index);
    this.emitter.fire();
  }

  getNodeByLocation(filePath: string, line: number): CodeNode | null {
    return this.index ? getNodeByLocation(this.index, filePath, line) : null;
  }
}

function isIndexableFile(filePath: string): boolean {
  return /\.(ts|tsx|js|jsx|mts|cts|mjs|cjs|py|sh|bash|zsh|json|jsonc)$/.test(filePath);
}

function hashText(value: string): string {
  let hash = 0;
  for (let index = 0; index < value.length; index += 1) {
    hash = (hash << 5) - hash + value.charCodeAt(index);
    hash |= 0;
  }
  return Math.abs(hash).toString(16);
}
