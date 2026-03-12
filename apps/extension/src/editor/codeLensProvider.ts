import * as vscode from "vscode";

import { COMMANDS } from "@code-vibe/shared";

import type { IndexService } from "../services/indexService";

export class VibeCodeLensProvider implements vscode.CodeLensProvider {
  constructor(private readonly indexService: IndexService) {}

  provideCodeLenses(document: vscode.TextDocument): vscode.CodeLens[] {
    const index = this.indexService.getIndex();
    if (!index) {
      return [];
    }

    const relativePath = vscode.workspace.asRelativePath(document.uri, false);
    return index.nodes
      .filter(
        (node) =>
          node.path === relativePath &&
          node.kind !== "file" &&
          !["method"].includes(node.kind)
      )
      .map((node) => {
        const range = new vscode.Range(
          new vscode.Position(node.rangeStartLine - 1, 0),
          new vscode.Position(node.rangeStartLine - 1, 0)
        );
        return new vscode.CodeLens(range, {
          command: COMMANDS.explainCurrentSymbol,
          title: "Explain symbol",
          arguments: [node.id]
        });
      });
  }
}

