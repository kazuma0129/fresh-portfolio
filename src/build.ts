import { mkdir, rm, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { renderDocument } from "./html.ts";
import { renderDiscovery } from "./discovery.ts";

export const rootDir = new URL("..", import.meta.url).pathname;
export const distDir = join(rootDir, "dist");

const requiredAssets = ["favicon.svg", "manifest.json"] as const;

export async function build(): Promise<void> {
  await rm(distDir, { recursive: true, force: true });
  await mkdir(distDir, { recursive: true });

  const pages = [{ path: "/", file: "index.html", html: renderDocument() }];
  for (const page of pages) {
    await mkdir(dirname(join(distDir, page.file)), { recursive: true });
    await writeFile(join(distDir, page.file), page.html);
  }
  for (const [path, contents] of Object.entries(renderDiscovery(pages[0].html, pages.map(page => page.path)))) {
    const output = join(distDir, path);
    await mkdir(dirname(output), { recursive: true });
    await writeFile(output, contents);
  }
  await Bun.write(join(distDir, "styles.css"), Bun.file(join(rootDir, "src/styles.css")));

  for (const asset of requiredAssets) {
    await Bun.write(join(distDir, asset), Bun.file(join(rootDir, `static/${asset}`)));
  }
}

if (import.meta.main) {
  await build();
}
