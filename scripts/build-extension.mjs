import esbuild from "esbuild";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");
const watch = process.argv.includes("--watch");

const ctx = await esbuild.context({
  entryPoints: [path.join(root, "apps/extension/src/extension.ts")],
  outfile: path.join(root, "apps/extension/dist/extension.js"),
  bundle: true,
  format: "cjs",
  platform: "node",
  target: "node20",
  sourcemap: true,
  external: ["vscode"],
  tsconfig: path.join(root, "apps/extension/tsconfig.json"),
  logLevel: "info"
});

if (watch) {
  await ctx.watch();
  process.stdout.write("Watching extension bundle...\n");
} else {
  await ctx.rebuild();
  await ctx.dispose();
}

