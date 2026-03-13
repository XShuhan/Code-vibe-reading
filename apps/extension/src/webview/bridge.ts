import * as vscode from "vscode";

import type { WebviewState } from "@code-vibe/shared";
import { resolveWebviewDistUri } from "./assets";

export function createWebviewHtml(
  webview: vscode.Webview,
  extensionUri: vscode.Uri,
  state: WebviewState
): string {
  const webviewDistUri = resolveWebviewDistUri(extensionUri);
  const scriptUri = webview.asWebviewUri(
    vscode.Uri.joinPath(webviewDistUri, "main.js")
  );
  const styleUri = webview.asWebviewUri(
    vscode.Uri.joinPath(webviewDistUri, "main.css")
  );
  const nonce = String(Date.now());
  const csp = [
    `default-src 'none';`,
    `img-src ${webview.cspSource} data:;`,
    `style-src ${webview.cspSource} 'unsafe-inline';`,
    `script-src 'nonce-${nonce}';`
  ].join(" ");

  return `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta http-equiv="Content-Security-Policy" content="${csp}" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <link rel="stylesheet" href="${styleUri}" />
    <title>${escapeHtml(state.title)}</title>
  </head>
  <body>
    <div id="root"></div>
    <script nonce="${nonce}">
      window.__VIBE_STATE__ = ${serializeForInlineScript(state)};
    </script>
    <script nonce="${nonce}" src="${scriptUri}"></script>
  </body>
</html>`;
}

function escapeHtml(value: string): string {
  return value.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;");
}

function serializeForInlineScript(value: unknown): string {
  return JSON.stringify(value)
    .replaceAll("<", "\\u003C")
    .replaceAll(">", "\\u003E")
    .replaceAll("&", "\\u0026")
    .replaceAll("\u2028", "\\u2028")
    .replaceAll("\u2029", "\\u2029");
}
