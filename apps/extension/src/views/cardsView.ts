import * as vscode from "vscode";

import type { Card } from "@code-vibe/shared";

import type { CardService } from "../services/cardService";

export class CardsViewProvider implements vscode.TreeDataProvider<Card> {
  private readonly emitter = new vscode.EventEmitter<Card | undefined>();

  readonly onDidChangeTreeData = this.emitter.event;

  constructor(private readonly cardService: CardService) {
    this.cardService.onDidChange(() => this.emitter.fire(undefined));
  }

  getTreeItem(card: Card): vscode.TreeItem {
    const item = new vscode.TreeItem(card.title, vscode.TreeItemCollapsibleState.None);
    item.description = `${card.type} ${card.tags.length > 0 ? `· ${card.tags.join(", ")}` : ""}`;
    item.tooltip = card.summary;
    item.contextValue = "card";
    item.command = {
      command: "vibe.openCard",
      title: "Open Card",
      arguments: [card]
    };
    item.iconPath = new vscode.ThemeIcon("note");
    return item;
  }

  getChildren(): Card[] {
    return this.cardService.getCards();
  }
}

