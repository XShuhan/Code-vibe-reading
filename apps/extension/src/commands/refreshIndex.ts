import * as vscode from "vscode";

import type { IndexService } from "../services/indexService";

export function registerRefreshIndexCommand(
  context: vscode.ExtensionContext,
  indexService: IndexService
): void {
  context.subscriptions.push(
    vscode.commands.registerCommand("vibe.refreshIndex", async () => {
      await indexService.refresh("manual");
      vscode.window.showInformationMessage("Vibe index refreshed.");
    })
  );
}

