import fs from "node:fs";

import * as vscode from "vscode";

export function resolveWebviewDistUri(extensionUri: vscode.Uri): vscode.Uri {
  const candidates = [
    vscode.Uri.joinPath(extensionUri, "apps", "webview", "dist"),
    vscode.Uri.joinPath(extensionUri, "..", "webview", "dist"),
    vscode.Uri.joinPath(extensionUri, "..", "..", "apps", "webview", "dist")
  ];

  for (const candidate of candidates) {
    if (fs.existsSync(candidate.fsPath)) {
      return candidate;
    }
  }

  return candidates[0];
}
