import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";

import { describe, expect, it } from "vitest";

import { indexWorkspace, traceCallPath } from "./index";

describe("analyzer", () => {
  it("indexes ts/js symbols and edges", async () => {
    const root = await fs.mkdtemp(path.join(os.tmpdir(), "vibe-analyzer-"));

    await fs.mkdir(path.join(root, "src"), { recursive: true });
    await fs.writeFile(
      path.join(root, "src/auth.ts"),
      [
        "export function createSession(userId: string) {",
        "  return issueToken(userId);",
        "}",
        "",
        "export function issueToken(userId: string) {",
        "  return `token-${userId}`;",
        "}"
      ].join("\n")
    );
    await fs.writeFile(
      path.join(root, "src/auth.test.ts"),
      [
        "import { createSession } from './auth';",
        "",
        "test('creates token', () => {",
        "  expect(createSession('u1')).toContain('token');",
        "});"
      ].join("\n")
    );

    const index = await indexWorkspace(root);
    const createSessionNode = index.nodes.find((node) => node.name === "createSession");
    const issueTokenNode = index.nodes.find((node) => node.name === "issueToken");

    expect(createSessionNode).toBeTruthy();
    expect(issueTokenNode).toBeTruthy();
    // Test files create "tests" edges when importing, regular files create "imports" edges
    expect(index.edges.some((edge) => edge.type === "tests" || edge.type === "imports")).toBe(true);
    expect(index.edges.some((edge) => edge.type === "calls")).toBe(true);

    const trace = traceCallPath(index, issueTokenNode!.id);
    expect(trace.callers.some((edge) => edge.fromNodeId === createSessionNode!.id)).toBe(true);
  });
});
