import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

async function copyDir(source: string, target: string): Promise<void> {
  await fs.mkdir(target, { recursive: true });
  const entries = await fs.readdir(source, { withFileTypes: true });

  for (const entry of entries) {
    const from = path.join(source, entry.name);
    const to = path.join(target, entry.name);
    if (entry.isDirectory()) {
      await copyDir(from, to);
    } else {
      await fs.copyFile(from, to);
    }
  }
}

export async function makeFixtureWorkspace(name = "sample-ts-repo"): Promise<string> {
  const root = path.dirname(fileURLToPath(import.meta.url));
  const fixturePath = path.resolve(root, "..", "fixtures", name);
  const tempDir = await fs.mkdtemp(path.join(os.tmpdir(), `vibe-fixture-${name}-`));
  await copyDir(fixturePath, tempDir);
  return tempDir;
}

