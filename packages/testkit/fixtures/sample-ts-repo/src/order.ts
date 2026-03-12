import { createSession } from "./auth";

export function placeOrder(userId: string) {
  const token = createSession(userId);
  return { id: `${userId}-${token}`, status: "created" };
}

