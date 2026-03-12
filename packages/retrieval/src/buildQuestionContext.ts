import { getNodeByLocation } from "@code-vibe/analyzer";
import type { EditorSelectionState, QuestionContext, WorkspaceIndex } from "@code-vibe/shared";

export function buildQuestionContext(
  index: WorkspaceIndex,
  editorState: EditorSelectionState,
  userQuestion: string,
  selectedCardIds: string[] = []
): QuestionContext {
  const currentNode =
    editorState.currentSymbolId
      ? index.nodes.find((node) => node.id === editorState.currentSymbolId) ?? null
      : getNodeByLocation(index, editorState.activeFile, editorState.startLine);

  const nearbySymbolIds = index.nodes
    .filter(
      (node) =>
        node.path === editorState.activeFile &&
        node.id !== currentNode?.id &&
        Math.abs(node.rangeStartLine - editorState.startLine) <= 40
    )
    .map((node) => node.id);

  return {
    workspaceId: index.snapshot.id,
    activeFile: editorState.activeFile,
    activeSelection: {
      startLine: editorState.startLine,
      endLine: editorState.endLine,
      text: editorState.selectedText
    },
    activeSymbolId: currentNode?.id,
    nearbySymbolIds,
    selectedCardIds,
    userQuestion
  };
}

