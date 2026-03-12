import * as vscode from "vscode";

import type { Citation } from "@code-vibe/shared";

export async function openCitation(
  rootPath: string,
  citation: Citation
): Promise<void> {
  const fileUri = vscode.Uri.joinPath(vscode.Uri.file(rootPath), citation.path);
  const document = await vscode.workspace.openTextDocument(fileUri);
  const editor = await vscode.window.showTextDocument(document, {
    preview: false
  });
  const start = new vscode.Position(Math.max(0, citation.startLine - 1), 0);
  const end = new vscode.Position(Math.max(0, citation.endLine - 1), 999);
  editor.selection = new vscode.Selection(start, end);
  editor.revealRange(new vscode.Range(start, end), vscode.TextEditorRevealType.InCenter);
}

export async function openSourceLocation(
  rootPath: string,
  relativePath: string,
  line: number
): Promise<void> {
  await openCitation(rootPath, {
    id: `${relativePath}:${line}`,
    path: relativePath,
    startLine: line,
    endLine: line,
    label: `${relativePath}:${line}`
  });
}

