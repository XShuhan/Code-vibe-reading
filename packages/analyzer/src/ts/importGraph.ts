import path from "node:path";

import type { CodeEdge, CodeNode } from "@code-vibe/shared";

export function buildImportEdges(
  workspaceId: string,
  fileNode: CodeNode,
  importSpecifiers: string[],
  fileNodesByPath: Map<string, CodeNode>
): CodeEdge[] {
  return importSpecifiers.flatMap((specifier) => {
    const targetPath = resolveImportPath(fileNode.path, specifier, fileNodesByPath);
    if (!targetPath) {
      return [];
    }

    const targetNode = fileNodesByPath.get(targetPath);
    if (!targetNode) {
      return [];
    }

    const type = isTestFile(fileNode.path) ? "tests" : "imports";
    return [
      {
        id: `${workspaceId}:${type}:${fileNode.id}:${targetNode.id}`,
        workspaceId,
        fromNodeId: fileNode.id,
        toNodeId: targetNode.id,
        type
      }
    ];
  });
}

export function isTestFile(filePath: string): boolean {
  return /(?:^|\/).*\.(test|spec)\.[jt]sx?$/.test(filePath);
}

function resolveImportPath(
  sourcePath: string,
  specifier: string,
  fileNodesByPath: Map<string, CodeNode>
): string | null {
  if (!specifier.startsWith(".")) {
    return null;
  }

  const sourceDir = path.posix.dirname(sourcePath);
  const basePath = path.posix.normalize(path.posix.join(sourceDir, specifier));
  const candidates = [
    basePath,
    `${basePath}.ts`,
    `${basePath}.tsx`,
    `${basePath}.js`,
    `${basePath}.jsx`,
    `${basePath}.mts`,
    `${basePath}.cts`,
    `${basePath}.mjs`,
    `${basePath}.cjs`,
    `${basePath}.py`,
    `${basePath}.sh`,
    `${basePath}.bash`,
    `${basePath}.zsh`,
    `${basePath}.json`,
    `${basePath}.jsonc`,
    path.posix.join(basePath, "index.ts"),
    path.posix.join(basePath, "index.tsx"),
    path.posix.join(basePath, "index.js"),
    path.posix.join(basePath, "index.jsx"),
    path.posix.join(basePath, "__init__.py")
  ];

  return candidates.find((candidate) => fileNodesByPath.has(candidate)) ?? null;
}
