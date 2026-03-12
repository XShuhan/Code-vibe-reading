import type { Thread } from "@code-vibe/shared";

import { BaseJsonStore } from "./baseJsonStore";

export class ThreadStore extends BaseJsonStore<Thread[]> {
  constructor(filePath: string) {
    super(filePath, []);
  }
}

