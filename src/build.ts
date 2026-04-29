import { mkdir, rm, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { renderDocument } from "./html";

export const rootDir = new URL("..", import.meta.url).pathname;
export const distDir = join(rootDir, "dist");

const requiredAssets = ["favicon.svg", "manifest.json"] as const;

export async function build(): Promise<void> {
  await rm(distDir, { recursive: true, force: true });
  await mkdir(distDir, { recursive: true });

  await writeFile(join(distDir, "index.html"), renderDocument());
  await Bun.write(join(distDir, "styles.css"), Bun.file(join(rootDir, "src/styles.css")));

  for (const asset of requiredAssets) {
    await Bun.write(join(distDir, asset), Bun.file(join(rootDir, `static/${asset}`)));
  }
}

if (import.meta.main) {
  await build();
}
