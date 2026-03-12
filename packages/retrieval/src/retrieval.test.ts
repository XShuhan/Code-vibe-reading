import type { WorkspaceIndex } from "@code-vibe/shared";
import { describe, expect, it } from "vitest";

import { buildQuestionContext } from "./buildQuestionContext";
import { retrieveEvidence } from "./index";

const sampleIndex: WorkspaceIndex = {
  snapshot: {
    id: "workspace_1",
    rootUri: "/tmp/repo",
    revision: "r1",
    languageSet: ["typescript"],
    indexedAt: "2026-03-12T00:00:00.000Z",
    analyzerVersion: "0.1.0"
  },
  nodes: [
    {
      id: "file_auth",
      workspaceId: "workspace_1",
      kind: "file",
      name: "auth.ts",
      path: "src/auth.ts",
      rangeStartLine: 1,
      rangeEndLine: 20,
      exported: true
    },
    {
      id: "fn_createSession",
      workspaceId: "workspace_1",
      kind: "function",
      name: "createSession",
      path: "src/auth.ts",
      rangeStartLine: 1,
      rangeEndLine: 5,
      exported: true,
      parentId: "file_auth",
      signature: "createSession(userId: string)"
    },
    {
      id: "fn_issueToken",
      workspaceId: "workspace_1",
      kind: "function",
      name: "issueToken",
      path: "src/auth.ts",
      rangeStartLine: 7,
      rangeEndLine: 12,
      exported: true,
      parentId: "file_auth",
      signature: "issueToken(userId: string)"
    },
    {
      id: "file_test",
      workspaceId: "workspace_1",
      kind: "file",
      name: "auth.test.ts",
      path: "src/auth.test.ts",
      rangeStartLine: 1,
      rangeEndLine: 10,
      exported: true
    },
    {
      id: "fn_authTest",
      workspaceId: "workspace_1",
      kind: "function",
      name: "testAuthFlow",
      path: "src/auth.test.ts",
      rangeStartLine: 2,
      rangeEndLine: 6,
      exported: false,
      parentId: "file_test"
    }
  ],
  edges: [
    {
      id: "edge_calls",
      workspaceId: "workspace_1",
      fromNodeId: "fn_createSession",
      toNodeId: "fn_issueToken",
      type: "calls"
    },
    {
      id: "edge_tests",
      workspaceId: "workspace_1",
      fromNodeId: "file_test",
      toNodeId: "file_auth",
      type: "tests"
    }
  ],
  fileContents: {
    "src/auth.ts": [
      "export function createSession(userId: string) {",
      "  return issueToken(userId);",
      "}",
      "",
      "export function issueToken(userId: string) {",
      "  return `token-${userId}`;",
      "}"
    ].join("\n"),
    "src/auth.test.ts": [
      "import { createSession } from './auth';",
      "test('creates token', () => {",
      "  expect(createSession('u1')).toContain('token');",
      "});"
    ].join("\n")
  }
};

describe("retrieval", () => {
  it("prioritizes active symbol evidence before neighbors", () => {
    const ctx = buildQuestionContext(
      sampleIndex,
      {
        activeFile: "src/auth.ts",
        startLine: 1,
        endLine: 2,
        selectedText: "createSession",
        currentSymbolId: "fn_createSession"
      },
      "How is the session token created?"
    );

    const evidence = retrieveEvidence(sampleIndex, ctx);

    expect(evidence[0]?.symbolId).toBe("fn_createSession");
    expect(evidence.some((item) => item.symbolId === "fn_issueToken")).toBe(true);
  });
});
