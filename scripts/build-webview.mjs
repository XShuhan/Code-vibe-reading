import esbuild from "esbuild";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");
const watch = process.argv.includes("--watch");

const ctx = await esbuild.context({
  entryPoints: [path.join(root, "apps/webview/src/main.tsx")],
  outdir: path.join(root, "apps/webview/dist"),
  bundle: true,
  format: "iife",
  platform: "browser",
  target: ["chrome120"],
  sourcemap: true,
  loader: {
    ".svg": "dataurl"
  },
  tsconfig: path.join(root, "apps/webview/tsconfig.json"),
  logLevel: "info"
});

if (watch) {
  await ctx.watch();
  process.stdout.write("Watching webview bundle...\n");
} else {
  await ctx.rebuild();
  await ctx.dispose();
}

