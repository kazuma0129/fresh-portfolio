import { existsSync } from "node:fs";
import { join, normalize } from "node:path";
import { build, distDir } from "./build";

if (!existsSync(join(distDir, "index.html"))) {
  await build();
}

const mimeTypes: Record<string, string> = {
  ".css": "text/css; charset=utf-8",
  ".html": "text/html; charset=utf-8",
  ".json": "application/manifest+json; charset=utf-8",
  ".png": "image/png",
  ".svg": "image/svg+xml",
};

function contentType(pathname: string): string {
  const extension = pathname.slice(pathname.lastIndexOf("."));
  return mimeTypes[extension] ?? "application/octet-stream";
}

Bun.serve({
  port: Number(process.env.PORT ?? 3000),
  async fetch(request) {
    const url = new URL(request.url);
    const requestedPath = url.pathname === "/" ? "/index.html" : url.pathname;
    const filePath = normalize(join(distDir, requestedPath));

    if (filePath !== distDir && !filePath.startsWith(`${distDir}/`)) {
      return new Response("Not found", { status: 404 });
    }

    const file = Bun.file(filePath);
    if (!(await file.exists())) {
      return new Response("Not found", { status: 404 });
    }

    return new Response(file, {
      headers: {
        "content-type": contentType(requestedPath),
      },
    });
  },
});

console.log(`Serving ${distDir} at http://localhost:${process.env.PORT ?? 3000}`);
