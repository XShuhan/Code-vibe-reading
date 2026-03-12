import type { WorkspaceIndex } from "@code-vibe/shared";

import { BaseJsonStore } from "./baseJsonStore";

export class SnapshotStore extends BaseJsonStore<WorkspaceIndex | null> {
  constructor(filePath: string) {
    super(filePath, null);
  }
}

