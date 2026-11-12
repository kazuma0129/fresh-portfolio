import Negotiator from "negotiator";
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { WebStandardStreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/webStandardStreamableHttp.js";
import { CallToolRequestSchema, ErrorCode, ListToolsRequestSchema, McpError } from "@modelcontextprotocol/sdk/types.js";
import { apiPath, homepageLinks, origin, pagePaths, serverInfo, skillDescription } from "./site.ts";
import { handleApi, type Assets, type Env } from "./api.ts";
export { ApiQuota } from "./quota.ts";

async function handleMcp(request: Request, assets: Assets) {
  const source = request.headers.get("origin");
  if (source !== null && source !== origin && source !== new URL(request.url).origin)
    return new Response("Forbidden origin", { status: 403 });
  if (request.method !== "POST")
    return new Response(null, { status: 405, headers: { Allow: "POST" } });
  const server = new Server(serverInfo, { capabilities: { tools: {} } });
  const tool = "list_portfolio_sections";
  server.setRequestHandler(ListToolsRequestSchema, () => ({
    tools: [{ name: tool, description: skillDescription, inputSchema: { type: "object", properties: {}, additionalProperties: false },
      annotations: { readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: false } }],
  }));
  server.setRequestHandler(CallToolRequestSchema, async ({ params }) => {
    if (params.name !== tool || Object.keys(params.arguments ?? {}).length)
      throw new McpError(ErrorCode.InvalidParams, "Use list_portfolio_sections with no arguments");
    const index = await assets.fetch(new Request(new URL(apiPath, request.url)));
    if (!index.ok) throw new McpError(ErrorCode.InternalError, "Section index unavailable");
    return { content: [{ type: "text", text: await index.text() }] };
  });
  const transport = new WebStandardStreamableHTTPServerTransport({
    sessionIdGenerator: undefined, enableJsonResponse: true, maxRequestBodySize: 16 * 1024,
  });
  await server.connect(transport);
  try { return await transport.handleRequest(request); }
  finally { await server.close(); }
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);
    const accept = request.headers.get("accept") || "*/*";
    if (url.pathname === "/api" || url.pathname.startsWith("/api/")) return handleApi(request, env);
    if (url.pathname === "/mcp") {
      if (["GET", "HEAD"].includes(request.method) && /text\/html/i.test(accept) &&
          new Negotiator({ headers: { accept } }).mediaType(["text/event-stream", "text/html"]) === "text/html") {
        return new Response(null, { status: 303, headers: { Location: "/docs/mcp", Vary: "Accept", "Cache-Control": "no-store" } });
      }
      return handleMcp(request, env.ASSETS);
    }
    const read = request.method === "GET" || request.method === "HEAD";
    const type = new Negotiator({ headers: { accept } }).mediaType(["text/html", "text/markdown"]);
    if (!read || !pagePaths.includes(url.pathname)) {
      const asset = await env.ASSETS.fetch(request);
      if (!read || asset.status !== 404) return asset;
      const headers = new Headers(asset.headers);
      headers.set("Vary", "Accept");
      headers.set("Cache-Control", "no-store");
      if (type !== "text/markdown") return new Response(asset.body, { status: 404, headers });
      const body = "# Page not found\n\nThis address does not identify a published portfolio page. See the [API documentation](/docs) or the [sitemap](/sitemap.xml) for available URLs.\n";
      return new Response(request.method === "HEAD" ? null : body, { status: 404,
        headers: { "Content-Type": "text/markdown; charset=utf-8", Vary: "Accept", "Cache-Control": "no-store" } });
    }
    if (!type) return new Response(null, { status: 406, headers: { Vary: "Accept" } });
    const homepage = url.pathname === "/";
    if (type === "text/markdown") url.pathname = homepage ? "/portfolio.md" : url.pathname + ".md";
    const asset = await env.ASSETS.fetch(new Request(url, request));
    const response = new Response(request.method === "HEAD" ? null : asset.body, asset);
    response.headers.append("Vary", "Accept");
    if (homepage) response.headers.set("Link", homepageLinks);
    // Cloudflare's shared cache does not generally key on arbitrary Vary values.
    response.headers.set("Cache-Control", "private, max-age=0, must-revalidate");
    return response;
  },
};
