import * as vscode from "vscode";

import { getNodeChildren } from "@code-vibe/analyzer";
import type { CodeNode } from "@code-vibe/shared";

import type { IndexService } from "../services/indexService";
import { openSourceLocation } from "../editor/sourceJump";

export class MapViewProvider implements vscode.TreeDataProvider<CodeNode> {
  private readonly emitter = new vscode.EventEmitter<CodeNode | undefined>();

  readonly onDidChangeTreeData = this.emitter.event;

  constructor(private readonly indexService: IndexService) {
    this.indexService.onDidChange(() => this.emitter.fire(undefined));
  }

  getTreeItem(node: CodeNode): vscode.TreeItem {
    const collapsibleState = this.getChildren(node).then((children) =>
      children.length > 0
        ? vscode.TreeItemCollapsibleState.Collapsed
        : vscode.TreeItemCollapsibleState.None
    );

    const item = new vscode.TreeItem(
      node.name,
      vscode.TreeItemCollapsibleState.None
    );
    item.description = node.kind === "file" ? node.path : node.kind;
    item.tooltip = `${node.path}:${node.rangeStartLine}-${node.rangeEndLine}`;
    item.iconPath = new vscode.ThemeIcon(themeIconForNode(node.kind));
    item.command = {
      command: "vibe.openCitation",
      title: "Open Source",
      arguments: [
        {
          id: node.id,
          path: node.path,
          startLine: node.rangeStartLine,
          endLine: node.rangeEndLine,
          symbolId: node.id,
          label: `${node.path}:${node.rangeStartLine}-${node.rangeEndLine}`
        }
      ]
    };
    void collapsibleState.then((resolved) => {
      item.collapsibleState = resolved;
    });
    return item;
  }

  async getChildren(element?: CodeNode): Promise<CodeNode[]> {
    const index = this.indexService.getIndex();
    if (!index) {
      return [];
    }

    if (!element) {
      return index.nodes
        .filter((node) => node.kind === "file")
        .sort((left, right) => left.path.localeCompare(right.path));
    }

    return getNodeChildren(index, element.id);
  }
}

function themeIconForNode(kind: CodeNode["kind"]): string {
  switch (kind) {
    case "class":
      return "symbol-class";
    case "function":
      return "symbol-function";
    case "method":
      return "symbol-method";
    case "interface":
      return "symbol-interface";
    case "type":
      return "symbol-key";
    case "variable":
      return "symbol-variable";
    case "file":
    default:
      return "file-code";
  }
}

