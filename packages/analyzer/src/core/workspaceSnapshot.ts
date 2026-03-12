import type { WorkspaceSnapshot } from "@code-vibe/shared";

function hashText(value: string): string {
  let hash = 2166136261;
  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }

  return (hash >>> 0).toString(16).padStart(8, "0");
}

export function createWorkspaceSnapshot(
  rootUri: string,
  fileSignature: string,
  languageSet: string[]
): WorkspaceSnapshot {
  const revision = hashText(fileSignature);
  return {
    id: `workspace_${hashText(rootUri)}`,
    rootUri,
    revision,
    languageSet,
    indexedAt: new Date().toISOString(),
    analyzerVersion: "0.1.0"
  };
}

