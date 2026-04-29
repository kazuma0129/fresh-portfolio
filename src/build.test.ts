import { afterEach, describe, expect, test } from "bun:test";
import { existsSync } from "node:fs";
import { readFile, rm } from "node:fs/promises";
import { join } from "node:path";
import { build, distDir, rootDir } from "./build.ts";

describe("build", () => {
  afterEach(async () => {
    await rm(distDir, { recursive: true, force: true });
  });

  test("creates dist/index.html", async () => {
    await build();

    expect(existsSync(join(distDir, "index.html"))).toBe(true);
  });

  test("copies required static assets", async () => {
    await build();

    expect(existsSync(join(distDir, "styles.css"))).toBe(true);
    expect(existsSync(join(distDir, "favicon.svg"))).toBe(true);
    expect(existsSync(join(distDir, "manifest.json"))).toBe(true);
  });

  test("generated output excludes removed runtime surfaces", async () => {
    await build();

    const html = await readFile(join(distDir, "index.html"), "utf8");

    const removedSurfaces = [
      "Fre" + "sh",
      "Pre" + "act",
      "Tail" + "wind",
      "cdn.tail" + "windcss",
      "/po" + "sts",
      ".md",
    ];

    for (const surface of removedSurfaces) {
      expect(html).not.toContain(surface);
    }
  });

  test("styles include screen-only blank canvas treatments for light and dark themes", async () => {
    const css = await readFile(join(rootDir, "src/styles.css"), "utf8");

    expect(css).toContain("@media screen");
    expect(css).toContain(".a11y-inversion");
    expect(css).toContain("background-color: #ffffff !important");
    expect(css).toContain("color: #ffffff !important");
    expect(css).toContain(':root[data-theme="dark"]');
    expect(css).toContain("--background: #000000");
    expect(css).toContain("background-color: #000000 !important");
    expect(css).toContain("color: #000000 !important");
    expect(css).toContain("opacity: 0 !important");
  });
});
