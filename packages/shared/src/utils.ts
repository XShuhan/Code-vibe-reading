export function createId(prefix: string): string {
  return `${prefix}_${Math.random().toString(36).slice(2, 10)}`;
}

export function nowIso(): string {
  return new Date().toISOString();
}

export function relativePath(rootPath: string, fullPath: string): string {
  if (fullPath.startsWith(rootPath)) {
    return fullPath.slice(rootPath.length).replace(/^\/+/, "");
  }
  return fullPath;
}

export function excerptLines(content: string, startLine: number, endLine: number): string {
  const lines = content.split(/\r?\n/);
  return lines.slice(Math.max(0, startLine - 1), endLine).join("\n");
}
