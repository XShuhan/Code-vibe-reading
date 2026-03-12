import { getNodeByLocation } from "@code-vibe/analyzer";
import type { EditorSelectionState, EvidenceSpan, QuestionContext, WorkspaceIndex } from "@code-vibe/shared";
import { excerptLines } from "@code-vibe/shared";

import { assemblePromptContext } from "./assemblePromptContext";
import { buildQuestionContext } from "./buildQuestionContext";
import { graphExpansion } from "./graphExpansion";
import { lexicalSearch } from "./lexicalSearch";
import { rankEvidence } from "./rankEvidence";

export {
  assemblePromptContext,
  buildQuestionContext,
  graphExpansion,
  lexicalSearch,
  rankEvidence
};

export function retrieveEvidence(index: WorkspaceIndex, ctx: QuestionContext): EvidenceSpan[] {
  const candidates: EvidenceSpan[] = [];

  if (ctx.activeSymbolId) {
    const activeNode = index.nodes.find((node) => node.id === ctx.activeSymbolId);
    if (activeNode) {
      candidates.push({
        id: `evidence:${activeNode.id}:selection`,
        workspaceId: index.snapshot.id,
        path: activeNode.path,
        startLine: activeNode.rangeStartLine,
        endLine: activeNode.rangeEndLine,
        symbolId: activeNode.id,
        excerpt: excerptLines(
          index.fileContents[activeNode.path] ?? "",
          activeNode.rangeStartLine,
          Math.min(activeNode.rangeEndLine, activeNode.rangeStartLine + 16)
        ),
        score: 10,
        reason: "Active symbol"
      });
    }
  } else {
    const fileContent = index.fileContents[ctx.activeFile] ?? "";
    const startLine = ctx.activeSelection?.startLine ?? 1;
    const endLine = ctx.activeSelection?.endLine ?? Math.min(12, fileContent.split(/\r?\n/).length);
    candidates.push({
      id: `evidence:file:${ctx.activeFile}:${startLine}`,
      workspaceId: index.snapshot.id,
      path: ctx.activeFile,
      startLine,
      endLine,
      excerpt: excerptLines(fileContent, startLine, endLine),
      score: 6,
      reason: "Active file selection"
    });
  }

  candidates.push(...graphExpansion(index, ctx.activeSymbolId));
  candidates.push(...lexicalSearch(index, `${ctx.userQuestion}\n${ctx.activeSelection?.text ?? ""}`));

  return rankEvidence(index, ctx, candidates);
}

export function buildSelectionQuestionContext(
  index: WorkspaceIndex,
  editorState: EditorSelectionState,
  userQuestion: string,
  selectedCardIds: string[] = []
): {
  context: QuestionContext;
  evidence: EvidenceSpan[];
} {
  const node =
    editorState.currentSymbolId
      ? index.nodes.find((entry) => entry.id === editorState.currentSymbolId) ?? null
      : getNodeByLocation(index, editorState.activeFile, editorState.startLine);

  const context = buildQuestionContext(
    index,
    {
      ...editorState,
      currentSymbolId: node?.id
    },
    userQuestion,
    selectedCardIds
  );

  return {
    context,
    evidence: retrieveEvidence(index, context)
  };
}

