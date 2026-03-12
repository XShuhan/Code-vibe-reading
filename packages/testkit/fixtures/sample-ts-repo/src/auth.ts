export function createSession(userId: string) {
  return issueToken(userId);
}

export function issueToken(userId: string) {
  return `token-${userId}`;
}

