import type { EvidenceSpan, QuestionContext, WorkspaceIndex } from "@code-vibe/shared";

export function assemblePromptContext(
  index: WorkspaceIndex,
  ctx: QuestionContext,
  evidence: EvidenceSpan[]
): string {
  const selectionBlock = ctx.activeSelection
    ? `Selection (${ctx.activeFile}:${ctx.activeSelection.startLine}-${ctx.activeSelection.endLine}):\n${ctx.activeSelection.text}`
    : `Active file: ${ctx.activeFile}`;

  const evidenceBlock = evidence
    .map((item, indexPosition) => {
      const nodeName = item.symbolId
        ? index.nodes.find((node) => node.id === item.symbolId)?.name ?? "unknown"
        : "file";
      return [
        `Evidence ${indexPosition + 1}`,
        `Path: ${item.path}:${item.startLine}-${item.endLine}`,
        `Symbol: ${nodeName}`,
        `Reason: ${item.reason}`,
        item.excerpt
      ].join("\n");
    })
    .join("\n\n");

  return `${selectionBlock}\n\nQuestion:\n${ctx.userQuestion}\n\nEvidence:\n${evidenceBlock}`;
}

