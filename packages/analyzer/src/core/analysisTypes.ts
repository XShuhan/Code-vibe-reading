import type { CodeEdge, CodeNode } from "@code-vibe/shared";

export interface CallReference {
  callerNodeId: string;
  filePath: string;
  name: string;
  receiverText?: string;
  containerName?: string;
}

export interface FileAnalysisResult {
  fileNode: CodeNode;
  nodes: CodeNode[];
  containsEdges: CodeEdge[];
  importSpecifiers: string[];
  callReferences: CallReference[];
}
