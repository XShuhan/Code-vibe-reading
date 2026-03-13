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

  it("indexes python classes, functions, imports, and calls", async () => {
    const root = await fs.mkdtemp(path.join(os.tmpdir(), "vibe-analyzer-py-"));

    await fs.mkdir(path.join(root, "src"), { recursive: true });
    await fs.writeFile(
      path.join(root, "src/helpers.py"),
      [
        "def issue_token(user_id):",
        "    return f'token-{user_id}'"
      ].join("\n")
    );
    await fs.writeFile(
      path.join(root, "src/auth.py"),
      [
        "from .helpers import issue_token",
        "",
        "class SessionService:",
        "    def create_session(self, user_id):",
        "        return issue_token(user_id)"
      ].join("\n")
    );

    const index = await indexWorkspace(root);
    const classNode = index.nodes.find((node) => node.kind === "class" && node.name === "SessionService");
    const methodNode = index.nodes.find((node) => node.kind === "method" && node.name === "create_session");
    const helperNode = index.nodes.find((node) => node.kind === "function" && node.name === "issue_token");

    expect(index.snapshot.languageSet).toContain("python");
    expect(classNode).toBeTruthy();
    expect(methodNode).toBeTruthy();
    expect(helperNode).toBeTruthy();
    expect(index.edges.some((edge) => edge.type === "imports")).toBe(true);
    expect(index.edges.some((edge) => edge.type === "calls")).toBe(true);
  });

  it("indexes shell functions and source relationships", async () => {
    const root = await fs.mkdtemp(path.join(os.tmpdir(), "vibe-analyzer-sh-"));

    await fs.mkdir(path.join(root, "scripts"), { recursive: true });
    await fs.writeFile(
      path.join(root, "scripts/lib.sh"),
      [
        "log_info() {",
        "  echo \"info:$1\"",
        "}"
      ].join("\n")
    );
    await fs.writeFile(
      path.join(root, "scripts/build.sh"),
      [
        "source ./lib.sh",
        "",
        "run_build() {",
        "  log_info start",
        "}"
      ].join("\n")
    );

    const index = await indexWorkspace(root);
    const buildNode = index.nodes.find((node) => node.name === "run_build");
    const logNode = index.nodes.find((node) => node.name === "log_info");

    expect(index.snapshot.languageSet).toContain("shell");
    expect(buildNode).toBeTruthy();
    expect(logNode).toBeTruthy();
    expect(index.edges.some((edge) => edge.type === "imports")).toBe(true);
    expect(index.edges.some((edge) => edge.type === "calls")).toBe(true);
  });

  it("indexes json files and top-level keys", async () => {
    const root = await fs.mkdtemp(path.join(os.tmpdir(), "vibe-analyzer-json-"));

    await fs.mkdir(path.join(root, "config"), { recursive: true });
    await fs.writeFile(
      path.join(root, "config/app.json"),
      JSON.stringify(
        {
          name: "demo-app",
          version: "1.0.0",
          scripts: {
            test: "vitest run"
          }
        },
        null,
        2
      )
    );

    const index = await indexWorkspace(root);
    const fileNode = index.nodes.find((node) => node.kind === "file" && node.path === "config/app.json");
    const nameNode = index.nodes.find((node) => node.kind === "variable" && node.name === "name");
    const scriptsNode = index.nodes.find((node) => node.kind === "variable" && node.name === "scripts");

    expect(index.snapshot.languageSet).toContain("json");
    expect(fileNode).toBeTruthy();
    expect(nameNode).toBeTruthy();
    expect(scriptsNode).toBeTruthy();
  });
});
