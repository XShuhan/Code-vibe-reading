import type { CodeEdge, CodeNode } from "@code-vibe/shared";
import type { CallReference } from "../core/analysisTypes";

export function buildCallEdges(
  workspaceId: string,
  nodes: CodeNode[],
  callReferences: CallReference[]
): CodeEdge[] {
  const nodesByName = new Map<string, CodeNode[]>();
  const nodesByQualifiedName = new Map<string, CodeNode>();

  for (const node of nodes) {
    if (node.kind === "file") {
      continue;
    }

    const existing = nodesByName.get(node.name) ?? [];
    existing.push(node);
    nodesByName.set(node.name, existing);

    if (node.parentId) {
      nodesByQualifiedName.set(`${node.parentId}:${node.name}`, node);
    }
  }

  const edges = new Map<string, CodeEdge>();

  for (const reference of callReferences) {
    const matches = resolveTargets(reference, nodesByName);
    for (const match of matches) {
      const inferred = match.path !== reference.filePath;
      const edge: CodeEdge = {
        id: `${workspaceId}:calls:${reference.callerNodeId}:${match.id}`,
        workspaceId,
        fromNodeId: reference.callerNodeId,
        toNodeId: match.id,
        type: "calls",
        inferred
      };
      edges.set(edge.id, edge);
    }

    if (reference.receiverText === "this" && reference.containerName) {
      const sameClassTarget = [...nodesByName.get(reference.name) ?? []].find(
        (node) => node.parentId?.endsWith(`:class:${reference.containerName}:${node.rangeStartLine}`) ?? false
      );
      if (sameClassTarget) {
        edges.set(`${workspaceId}:calls:${reference.callerNodeId}:${sameClassTarget.id}`, {
          id: `${workspaceId}:calls:${reference.callerNodeId}:${sameClassTarget.id}`,
          workspaceId,
          fromNodeId: reference.callerNodeId,
          toNodeId: sameClassTarget.id,
          type: "calls",
          inferred: false
        });
      }
    }
  }

  return [...edges.values()];
}

function resolveTargets(reference: CallReference, nodesByName: Map<string, CodeNode[]>): CodeNode[] {
  const candidates = nodesByName.get(reference.name) ?? [];
  const sameFile = candidates.filter((candidate) => candidate.path === reference.filePath);
  if (sameFile.length > 0) {
    return sameFile;
  }

  if (candidates.length === 1) {
    return candidates;
  }

  return candidates.filter((candidate) => candidate.exported);
}
