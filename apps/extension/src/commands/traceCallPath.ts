import * as vscode from "vscode";

import { getActiveSelectionState } from "../editor/selectionContext";
import type { CardService } from "../services/cardService";
import type { IndexService } from "../services/indexService";
import type { VibeController } from "../services/vibeController";

export function registerTraceCallPathCommand(
  context: vscode.ExtensionContext,
  indexService: IndexService,
  cardService: CardService,
  controller: VibeController
): void {
  context.subscriptions.push(
    vscode.commands.registerCommand("vibe.traceCallPath", async () => {
      const editorState = getActiveSelectionState(indexService.getIndex());
      const nodeId = editorState?.currentSymbolId;
      if (!nodeId) {
        vscode.window.showWarningMessage("Place the cursor inside a symbol before tracing the call path.");
        return;
      }

      try {
        const card = await cardService.createTraceCard(nodeId);
        await controller.openCard(card.id);
      } catch (error) {
        vscode.window.showErrorMessage(String(error));
      }
    })
  );
}

