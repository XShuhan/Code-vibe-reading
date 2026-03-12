import { describe, expect, it } from "vitest";

import { getNodeByLocation, getNeighbors, getNodeChildren, getNodeMap, traceCallPath } from "./index";
import type { CodeNode, CodeEdge, WorkspaceIndex } from "@code-vibe/shared";

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
      id: "cls_UserService",
      workspaceId: "workspace_1",
      kind: "class",
      name: "UserService",
      path: "src/auth.ts",
      rangeStartLine: 14,
      rangeEndLine: 30,
      exported: true,
      parentId: "file_auth"
    },
    {
      id: "method_getUser",
      workspaceId: "workspace_1",
      kind: "method",
      name: "getUser",
      path: "src/auth.ts",
      rangeStartLine: 15,
      rangeEndLine: 20,
      exported: false,
      parentId: "cls_UserService"
    }
  ],
  edges: [
    {
      id: "edge_contains_1",
      workspaceId: "workspace_1",
      fromNodeId: "file_auth",
      toNodeId: "fn_createSession",
      type: "contains"
    },
    {
      id: "edge_contains_2",
      workspaceId: "workspace_1",
      fromNodeId: "file_auth",
      toNodeId: "fn_issueToken",
      type: "contains"
    },
    {
      id: "edge_contains_3",
      workspaceId: "workspace_1",
      fromNodeId: "file_auth",
      toNodeId: "cls_UserService",
      type: "contains"
    },
    {
      id: "edge_contains_4",
      workspaceId: "workspace_1",
      fromNodeId: "cls_UserService",
      toNodeId: "method_getUser",
      type: "contains"
    },
    {
      id: "edge_calls",
      workspaceId: "workspace_1",
      fromNodeId: "fn_createSession",
      toNodeId: "fn_issueToken",
      type: "calls"
    }
  ],
  fileContents: {
    "src/auth.ts": "export function createSession(userId: string) {\n  return issueToken(userId);\n}\n\nexport function issueToken(userId: string) {\n  return `token-${userId}`;\n}\n\nexport class UserService {\n  getUser(id: string) {\n    return { id };\n  }\n}"
  }
};

describe("analyzer utilities", () => {
  describe("getNodeByLocation", () => {
    it("finds node at given location", () => {
      const node = getNodeByLocation(sampleIndex, "src/auth.ts", 2);
      expect(node).toBeTruthy();
      expect(node?.name).toBe("createSession");
    });

    it("returns null for unknown location", () => {
      const node = getNodeByLocation(sampleIndex, "src/unknown.ts", 1);
      expect(node).toBeNull();
    });

    it("prefers smallest matching node", () => {
      // Line 15 is inside both the file and the class, should return the method
      const node = getNodeByLocation(sampleIndex, "src/auth.ts", 16);
      expect(node?.kind).toBe("method");
      expect(node?.name).toBe("getUser");
    });
  });

  describe("getNeighbors", () => {
    it("returns edges connected to node", () => {
      const edges = getNeighbors(sampleIndex, "fn_createSession");
      expect(edges.length).toBe(2); // contains edge from file, calls edge to issueToken
    });

    it("returns empty array for isolated node", () => {
      const edges = getNeighbors(sampleIndex, "nonexistent");
      expect(edges).toEqual([]);
    });
  });

  describe("getNodeChildren", () => {
    it("returns child nodes", () => {
      const children = getNodeChildren(sampleIndex, "file_auth");
      expect(children.length).toBe(3);
      expect(children.map(c => c.name)).toContain("createSession");
      expect(children.map(c => c.name)).toContain("issueToken");
      expect(children.map(c => c.name)).toContain("UserService");
    });

    it("returns empty array for leaf node", () => {
      const children = getNodeChildren(sampleIndex, "method_getUser");
      expect(children).toEqual([]);
    });
  });

  describe("getNodeMap", () => {
    it("creates map of all nodes", () => {
      const map = getNodeMap(sampleIndex);
      expect(map.size).toBe(sampleIndex.nodes.length);
      expect(map.has("fn_createSession")).toBe(true);
      expect(map.get("fn_createSession")?.name).toBe("createSession");
    });
  });

  describe("traceCallPath", () => {
    it("traces callers and callees", () => {
      const trace = traceCallPath(sampleIndex, "fn_issueToken");
      expect(trace.anchorNodeId).toBe("fn_issueToken");
      expect(trace.callers.length).toBe(1);
      expect(trace.callers[0].fromNodeId).toBe("fn_createSession");
      expect(trace.callees.length).toBe(0);
    });

    it("includes non-call neighbors", () => {
      const trace = traceCallPath(sampleIndex, "fn_createSession");
      expect(trace.callees.length).toBe(1);
      expect(trace.callees[0].toNodeId).toBe("fn_issueToken");
      // Should have contains edge as neighbor
      expect(trace.neighbors.some(e => e.type === "contains")).toBe(true);
    });
  });
});
