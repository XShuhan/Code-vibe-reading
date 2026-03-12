import * as vscode from "vscode";

import type { Thread } from "@code-vibe/shared";

import type { CardService } from "../services/cardService";
import type { CanvasService } from "../services/canvasService";
import type { ThreadService } from "../services/threadService";
import type { VibeController } from "../services/vibeController";

export function registerAddThreadAnswerToCanvasCommand(
  context: vscode.ExtensionContext,
  threadService: ThreadService,
  cardService: CardService,
  canvasService: CanvasService,
  controller: VibeController
): void {
  context.subscriptions.push(
    vscode.commands.registerCommand("vibe.addThreadAnswerToCanvas", async (threadArg?: Thread) => {
      const thread =
        threadArg ??
        threadService.getThreads()[0];
      if (!thread) {
        vscode.window.showWarningMessage("No thread is available to add to the canvas.");
        return;
      }

      try {
        const card = await cardService.createCardFromThread(thread);
        await canvasService.addCard(card.id);
        await controller.openCanvas();
      } catch (error) {
        vscode.window.showErrorMessage(String(error));
      }
    })
  );
}

