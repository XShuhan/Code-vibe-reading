import * as vscode from "vscode";

import { getActiveSelectionState } from "../editor/selectionContext";
import type { CardService } from "../services/cardService";
import type { IndexService } from "../services/indexService";
import type { VibeController } from "../services/vibeController";

export function registerSaveSelectionAsCardCommand(
  context: vscode.ExtensionContext,
  indexService: IndexService,
  cardService: CardService,
  controller: VibeController
): void {
  context.subscriptions.push(
    vscode.commands.registerCommand("vibe.saveSelectionAsCard", async () => {
      const editorState = getActiveSelectionState(indexService.getIndex());
      if (!editorState) {
        vscode.window.showWarningMessage("Open a workspace file before saving a card.");
        return;
      }

      const title = await vscode.window.showInputBox({
        prompt: "Card title",
        value: editorState.selectedText ? "New reading card" : undefined
      });

      const card = await cardService.createCardFromSelection(editorState, title);
      await controller.openCard(card.id);
      vscode.window.showInformationMessage(`Saved card: ${card.title}`);
    })
  );
}

