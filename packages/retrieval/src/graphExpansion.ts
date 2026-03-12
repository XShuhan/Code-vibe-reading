import { getNeighbors, getNodeMap } from "@code-vibe/analyzer";
import type { EvidenceSpan, WorkspaceIndex } from "@code-vibe/shared";
import { excerptLines } from "@code-vibe/shared";

export function graphExpansion(index: WorkspaceIndex, anchorNodeId?: string): EvidenceSpan[] {
  if (!anchorNodeId) {
    return [];
  }

  const nodeMap = getNodeMap(index);
  return getNeighbors(index, anchorNodeId).flatMap((edge) => {
    const neighborId = edge.fromNodeId === anchorNodeId ? edge.toNodeId : edge.fromNodeId;
    const node = nodeMap.get(neighborId);
    if (!node || node.kind === "file") {
      return [];
    }

    return [
      {
        id: `evidence:${node.id}:${edge.type}`,
        workspaceId: index.snapshot.id,
        path: node.path,
        startLine: node.rangeStartLine,
        endLine: node.rangeEndLine,
        symbolId: node.id,
        excerpt: excerptLines(
          index.fileContents[node.path] ?? "",
          node.rangeStartLine,
          Math.min(node.rangeEndLine, node.rangeStartLine + 12)
        ),
        score: edge.type === "calls" ? 6 : edge.type === "imports" ? 4 : 3,
        reason: `Graph neighbor via ${edge.type}${edge.inferred ? " (inferred)" : ""}`
      } satisfies EvidenceSpan
    ];
  });
}

