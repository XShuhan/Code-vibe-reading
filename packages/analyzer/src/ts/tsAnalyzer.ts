import type { CodeEdge, CodeNode, WorkspaceIndex } from "@code-vibe/shared";

import { scanWorkspaceFiles } from "../core/fileScanner";
import { createWorkspaceSnapshot } from "../core/workspaceSnapshot";
import { buildCallEdges } from "./callGraph";
import { buildImportEdges } from "./importGraph";
import { analyzeSourceFile } from "./symbolExtractor";

export async function indexTypeScriptWorkspace(rootPath: string): Promise<WorkspaceIndex> {
  const scannedFiles = await scanWorkspaceFiles(rootPath);
  const fileSignature = scannedFiles
    .map((file) => `${file.relativePath}:${file.content.length}`)
    .join("|");
  const languageSet = collectLanguageSet(scannedFiles.map((file) => file.relativePath));
  const snapshot = createWorkspaceSnapshot(rootPath, fileSignature, languageSet);

  const nodes: CodeNode[] = [];
  const edges: CodeEdge[] = [];
  const fileContents: Record<string, string> = {};
  const importCandidates = new Map<string, string[]>();
  const callReferences: Array<{
    callerNodeId: string;
    filePath: string;
    name: string;
    receiverText?: string;
    containerName?: string;
  }> = [];

  for (const file of scannedFiles) {
    fileContents[file.relativePath] = file.content;
    try {
      const result = analyzeSourceFile({
        content: file.content,
        path: file.relativePath,
        workspaceId: snapshot.id
      });

      nodes.push(...result.nodes);
      edges.push(...result.containsEdges);
      importCandidates.set(result.fileNode.path, result.importSpecifiers);
      callReferences.push(...result.callReferences);
    } catch (error) {
      // Parsing failures should be isolated to the file.
      process.stderr.write(`[vibe][analyzer] failed to parse ${file.relativePath}: ${String(error)}\n`);
    }
  }

  const fileNodesByPath = new Map<string, CodeNode>(
    nodes.filter((node) => node.kind === "file").map((node) => [node.path, node])
  );

  for (const [filePath, importSpecifiers] of importCandidates.entries()) {
    const fileNode = fileNodesByPath.get(filePath);
    if (!fileNode) {
      continue;
    }

    edges.push(...buildImportEdges(snapshot.id, fileNode, importSpecifiers, fileNodesByPath));
  }

  edges.push(...buildCallEdges(snapshot.id, nodes, callReferences));

  return {
    snapshot,
    nodes,
    edges,
    fileContents
  };
}

function collectLanguageSet(paths: string[]): string[] {
  const languages = new Set<string>();
  for (const filePath of paths) {
    if (/\.(ts|tsx|mts|cts)$/.test(filePath)) {
      languages.add("typescript");
    }
    if (/\.(js|jsx|mjs|cjs)$/.test(filePath)) {
      languages.add("javascript");
    }
  }
  return [...languages];
}

