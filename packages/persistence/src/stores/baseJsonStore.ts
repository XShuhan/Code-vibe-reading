import fs from "node:fs/promises";
import path from "node:path";

export class BaseJsonStore<T> {
  constructor(
    private readonly filePath: string,
    private readonly fallbackValue: T
  ) {}

  async load(): Promise<T> {
    try {
      const raw = await fs.readFile(this.filePath, "utf8");
      return JSON.parse(raw) as T;
    } catch (error) {
      const nodeError = error as NodeJS.ErrnoException;
      if (nodeError.code === "ENOENT") {
        return structuredClone(this.fallbackValue);
      }

      return structuredClone(this.fallbackValue);
    }
  }

  async save(value: T): Promise<void> {
    await fs.mkdir(path.dirname(this.filePath), { recursive: true });
    await fs.writeFile(this.filePath, `${JSON.stringify(value, null, 2)}\n`, "utf8");
  }
}

