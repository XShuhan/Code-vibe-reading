import * as vscode from "vscode";

import type { Thread } from "@code-vibe/shared";

import { getModelConfig } from "../config/settings";
import { getActiveSelectionState } from "../editor/selectionContext";
import type { IndexService } from "../services/indexService";
import type { ThreadService } from "../services/threadService";
import type { VibeController } from "../services/vibeController";

export function registerAskAboutSelectionCommand(
  context: vscode.ExtensionContext,
  indexService: IndexService,
  threadService: ThreadService,
  controller: VibeController
): void {
  context.subscriptions.push(
    vscode.commands.registerCommand("vibe.askAboutSelection", async () => {
      await askAboutSelection(indexService, threadService, controller);
    })
  );
}

export async function askAboutSelection(
  indexService: IndexService,
  threadService: ThreadService,
  controller: VibeController,
  overrideQuestion?: string
): Promise<Thread | undefined> {
  const editorState = getActiveSelectionState(indexService.getIndex());
  if (!editorState) {
    vscode.window.showWarningMessage("Open a TS/JS file inside a workspace before asking Vibe.");
    return undefined;
  }

  const question =
    overrideQuestion ??
    (await vscode.window.showInputBox({
      prompt: "What do you want to understand about the current selection?",
      value: editorState.selectedText
        ? `Explain this code and its surrounding behavior`
        : `Explain the current symbol`
    }));

  if (!question) {
    return undefined;
  }

  try {
    const thread = await threadService.askQuestion(question, editorState, getModelConfig());
    await controller.openThread(thread.id);
    return thread;
  } catch (error) {
    vscode.window.showErrorMessage(String(error));
    return undefined;
  }
}

