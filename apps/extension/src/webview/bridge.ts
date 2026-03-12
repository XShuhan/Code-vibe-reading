import * as vscode from "vscode";

import type { WebviewState } from "@code-vibe/shared";

export function createWebviewHtml(
  webview: vscode.Webview,
  extensionUri: vscode.Uri,
  state: WebviewState
): string {
  const scriptUri = webview.asWebviewUri(
    vscode.Uri.joinPath(extensionUri, "apps", "webview", "dist", "main.js")
  );
  const styleUri = webview.asWebviewUri(
    vscode.Uri.joinPath(extensionUri, "apps", "webview", "dist", "main.css")
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
      window.__VIBE_STATE__ = ${JSON.stringify(state)};
    </script>
    <script nonce="${nonce}" src="${scriptUri}"></script>
  </body>
</html>`;
}

function escapeHtml(value: string): string {
  return value.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;");
}

