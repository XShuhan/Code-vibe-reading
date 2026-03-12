import * as vscode from "vscode";

import type { VibeController } from "../services/vibeController";

export function registerOpenCanvasCommand(
  context: vscode.ExtensionContext,
  controller: VibeController
): void {
  context.subscriptions.push(
    vscode.commands.registerCommand("vibe.openCanvas", async () => {
      await controller.openCanvas();
    })
  );
}

