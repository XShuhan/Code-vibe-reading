import type { EvidenceSpan, WorkspaceIndex } from "@code-vibe/shared";
import { excerptLines } from "@code-vibe/shared";

export function lexicalSearch(index: WorkspaceIndex, query: string): EvidenceSpan[] {
  const normalizedTokens = tokenize(query);
  if (normalizedTokens.length === 0) {
    return [];
  }

  return index.nodes
    .filter((node) => node.kind !== "file")
    .map((node) => {
      const content = index.fileContents[node.path] ?? "";
      const excerpt = excerptLines(content, node.rangeStartLine, Math.min(node.rangeEndLine, node.rangeStartLine + 12));
      const haystack = `${node.name}\n${node.signature ?? ""}\n${node.docComment ?? ""}\n${excerpt}`.toLowerCase();
      const score = normalizedTokens.reduce((sum, token) => sum + lexicalTokenScore(haystack, node.name, token), 0);

      return {
        id: `evidence:${node.id}:lexical`,
        workspaceId: index.snapshot.id,
        path: node.path,
        startLine: node.rangeStartLine,
        endLine: node.rangeEndLine,
        symbolId: node.id,
        excerpt,
        score,
        reason: score > 0 ? "Lexical match" : "No lexical match"
      } satisfies EvidenceSpan;
    })
    .filter((evidence) => evidence.score > 0)
    .sort((left, right) => right.score - left.score);
}

function tokenize(query: string): string[] {
  return query
    .toLowerCase()
    .split(/[^a-z0-9_]+/)
    .map((token) => token.trim())
    .filter(Boolean);
}

function lexicalTokenScore(haystack: string, name: string, token: string): number {
  let score = 0;
  if (name.toLowerCase() === token) {
    score += 6;
  }
  if (name.toLowerCase().includes(token)) {
    score += 4;
  }
  if (haystack.includes(token)) {
    score += 2;
  }
  return score;
}

