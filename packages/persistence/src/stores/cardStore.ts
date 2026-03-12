import type { Card } from "@code-vibe/shared";

import { BaseJsonStore } from "./baseJsonStore";

export class CardStore extends BaseJsonStore<Card[]> {
  constructor(filePath: string) {
    super(filePath, []);
  }
}

