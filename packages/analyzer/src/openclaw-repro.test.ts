import { describe, it } from "vitest";

import { indexWorkspace } from "./index";

describe("openclaw repro", () => {
  it("indexes the openclaw workspace without stack overflow", async () => {
    await indexWorkspace("/Users/xue/openclaw");
  }, 120000);
});
