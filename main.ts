import { renderDocument } from "./src/html.ts";

const textAssets = new Map([
  ["/styles.css", { path: "./src/styles.css", type: "text/css; charset=utf-8" }],
  ["/manifest.json", { path: "./static/manifest.json", type: "application/manifest+json; charset=utf-8" }],
]);

const binaryAssets = new Map([
  ["/favicon.svg", { path: "./static/favicon.svg", type: "image/svg+xml" }],
]);

Deno.serve(async (request) => {
  const { pathname } = new URL(request.url);

  if (pathname === "/" || pathname === "/index.html") {
    return new Response(renderDocument(), {
      headers: { "content-type": "text/html; charset=utf-8" },
    });
  }

  const textAsset = textAssets.get(pathname);
  if (textAsset) {
    return new Response(await Deno.readTextFile(new URL(textAsset.path, import.meta.url)), {
      headers: { "content-type": textAsset.type },
    });
  }

  const binaryAsset = binaryAssets.get(pathname);
  if (binaryAsset) {
    return new Response(await Deno.readFile(new URL(binaryAsset.path, import.meta.url)), {
      headers: { "content-type": binaryAsset.type },
    });
  }

  return new Response("Not found", { status: 404 });
});
