import type { CanvasState } from "@code-vibe/shared";

import { BaseJsonStore } from "./baseJsonStore";

export class CanvasStore extends BaseJsonStore<CanvasState | null> {
  constructor(filePath: string) {
    super(filePath, null);
  }
}

