import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";

import { describe, expect, it } from "vitest";

import type { Card, Thread, WorkspaceIndex } from "@code-vibe/shared";
import { createId, nowIso } from "@code-vibe/shared";

import { createWorkspacePersistence } from "./index";

describe("workspace persistence", () => {
  it("round-trips threads, cards, canvas, and index", async () => {
    const dir = await fs.mkdtemp(path.join(os.tmpdir(), "vibe-persist-"));
    const persistence = createWorkspacePersistence(dir, "workspace-test");

    const threads: Thread[] = [
      {
        id: createId("thread"),
        workspaceId: "workspace-test",
        title: "Auth flow",
        createdAt: nowIso(),
        updatedAt: nowIso(),
        contextRefs: [],
        messages: []
      }
    ];

    const cards: Card[] = [
      {
        id: createId("card"),
        workspaceId: "workspace-test",
        type: "ConceptCard",
        title: "Session token",
        summary: "Tracks session creation.",
        evidenceRefs: [],
        tags: ["auth"],
        createdAt: nowIso(),
        updatedAt: nowIso()
      }
    ];

    const index: WorkspaceIndex = {
      snapshot: {
        id: "workspace-test",
        rootUri: "/tmp/repo",
        revision: "1",
        languageSet: ["typescript"],
        indexedAt: nowIso(),
        analyzerVersion: "1"
      },
      nodes: [],
      edges: [],
      fileContents: {}
    };

    await persistence.saveThreads(threads);
    await persistence.saveCards(cards);
    await persistence.saveIndex(index);

    const canvas = await persistence.loadCanvas();
    canvas.nodes.push({
      id: createId("node"),
      cardId: cards[0].id,
      x: 20,
      y: 20,
      width: 260,
      height: 180
    });
    await persistence.saveCanvas(canvas);

    await expect(persistence.loadThreads()).resolves.toEqual(threads);
    await expect(persistence.loadCards()).resolves.toEqual(cards);
    await expect(persistence.loadIndex()).resolves.toEqual(index);
    await expect(persistence.loadCanvas()).resolves.toEqual(canvas);
  });
});
