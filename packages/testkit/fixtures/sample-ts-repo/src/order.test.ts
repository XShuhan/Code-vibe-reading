import { placeOrder } from "./order";

// Simple test file for fixture purposes - vitest globals
// @ts-ignore
describe("placeOrder", () => {
  // @ts-ignore
  it("creates an order", () => {
    // @ts-ignore
    expect(placeOrder("u1").status).toBe("created");
  });
});

