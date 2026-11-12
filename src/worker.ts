import Negotiator from "negotiator";
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { WebStandardStreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/webStandardStreamableHttp.js";
import { CallToolRequestSchema, ErrorCode, ListToolsRequestSchema, McpError } from "@modelcontextprotocol/sdk/types.js";
import { apiPath, homepageLinks, origin, serverInfo, skillDescription } from "./site.ts";

interface Assets { fetch(request: Request): Promise<Response> }

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
  async fetch(request: Request, env: { ASSETS: Assets }): Promise<Response> {
    const url = new URL(request.url);
    if (url.pathname === "/mcp") return handleMcp(request, env.ASSETS);
    if (url.pathname !== "/" || !["GET", "HEAD"].includes(request.method)) return env.ASSETS.fetch(request);
    const accept = request.headers.get("accept") || "*/*";
    const type = new Negotiator({ headers: { accept } }).mediaType(["text/html", "text/markdown"]);
    if (!type) return new Response(null, { status: 406, headers: { Vary: "Accept" } });
    if (type === "text/markdown") url.pathname = "/portfolio.md";
    const asset = await env.ASSETS.fetch(new Request(url, request));
    const response = new Response(request.method === "HEAD" ? null : asset.body, asset);
    response.headers.append("Vary", "Accept");
    response.headers.set("Link", homepageLinks);
    // Cloudflare's shared cache does not generally key on arbitrary Vary values.
    response.headers.set("Cache-Control", "private, max-age=0, must-revalidate");
    return response;
  },
};
