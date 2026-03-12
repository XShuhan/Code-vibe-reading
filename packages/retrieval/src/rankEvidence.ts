import type { EvidenceSpan, QuestionContext, WorkspaceIndex } from "@code-vibe/shared";

export function rankEvidence(
  index: WorkspaceIndex,
  ctx: QuestionContext,
  candidates: EvidenceSpan[]
): EvidenceSpan[] {
  const ranked = candidates.map((candidate) => {
    let score = candidate.score;

    if (ctx.activeSymbolId && candidate.symbolId === ctx.activeSymbolId) {
      score += 20;
    }

    if (candidate.path === ctx.activeFile) {
      score += 8;
    }

    if (
      ctx.activeSelection &&
      rangesOverlap(
        candidate.startLine,
        candidate.endLine,
        ctx.activeSelection.startLine,
        ctx.activeSelection.endLine
      )
    ) {
      score += 15;
    }

    if (ctx.nearbySymbolIds.includes(candidate.symbolId ?? "")) {
      score += 4;
    }

    if (/\.(test|spec)\.[jt]sx?$/.test(candidate.path)) {
      score += 2;
      candidate.reason = `${candidate.reason}; neighboring test`;
    }

    const node = candidate.symbolId
      ? index.nodes.find((item) => item.id === candidate.symbolId)
      : undefined;
    if (node?.docComment) {
      score += 1;
    }

    return {
      ...candidate,
      score
    };
  });

  ranked.sort((left, right) => right.score - left.score);
  return dedupeEvidence(ranked).slice(0, 8);
}

function rangesOverlap(
  leftStart: number,
  leftEnd: number,
  rightStart: number,
  rightEnd: number
): boolean {
  return leftStart <= rightEnd && rightStart <= leftEnd;
}

function dedupeEvidence(evidence: EvidenceSpan[]): EvidenceSpan[] {
  const seen = new Set<string>();
  return evidence.filter((item) => {
    const key = `${item.path}:${item.startLine}:${item.endLine}:${item.symbolId ?? "file"}`;
    if (seen.has(key)) {
      return false;
    }

    seen.add(key);
    return true;
  });
}

