import * as vscode from "vscode";

import type { Thread } from "@code-vibe/shared";

import type { ThreadService } from "../services/threadService";

export class ThreadsViewProvider implements vscode.TreeDataProvider<Thread> {
  private readonly emitter = new vscode.EventEmitter<Thread | undefined>();

  readonly onDidChangeTreeData = this.emitter.event;

  constructor(private readonly threadService: ThreadService) {
    this.threadService.onDidChange(() => this.emitter.fire(undefined));
  }

  getTreeItem(thread: Thread): vscode.TreeItem {
    const item = new vscode.TreeItem(thread.title, vscode.TreeItemCollapsibleState.None);
    item.description = new Date(thread.updatedAt).toLocaleString();
    item.tooltip = thread.contextRefs.join("\n");
    item.contextValue = "thread";
    item.command = {
      command: "vibe.openThread",
      title: "Open Thread",
      arguments: [thread]
    };
    item.iconPath = new vscode.ThemeIcon("comment-discussion");
    return item;
  }

  getChildren(): Thread[] {
    return this.threadService.getThreads();
  }
}

