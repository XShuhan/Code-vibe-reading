import * as vscode from "vscode";

import type { EditorSelectionState, WorkspaceIndex } from "@code-vibe/shared";
import { getNodeByLocation } from "@code-vibe/analyzer";

export function getActiveSelectionState(index: WorkspaceIndex | null): EditorSelectionState | null {
  const editor = vscode.window.activeTextEditor;
  if (!editor) {
    return null;
  }

  const document = editor.document;
  const workspaceFolder = vscode.workspace.getWorkspaceFolder(document.uri);
  if (!workspaceFolder) {
    return null;
  }

  const selection = editor.selection;
  const selectedText = editor.document.getText(selection);
  const startLine = selection.start.line + 1;
  const endLine = Math.max(selection.end.line + 1, startLine);
  const activeFile = vscode.workspace.asRelativePath(document.uri, false);
  const node = index ? getNodeByLocation(index, activeFile, startLine) : null;

  return {
    activeFile,
    startLine,
    endLine,
    selectedText: selectedText || getFallbackSelectionText(editor.document, startLine),
    currentSymbolId: node?.id
  };
}

function getFallbackSelectionText(document: vscode.TextDocument, line: number): string {
  const targetLine = document.lineAt(Math.max(0, line - 1));
  return targetLine.text;
}

