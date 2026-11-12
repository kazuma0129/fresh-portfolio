import assert from "node:assert/strict";
import { createHash } from "node:crypto";
const base = new URL(process.argv[2] ?? "https://kazuma0129.work");
const canonical = "https://kazuma0129.work";
function local(url) {
  const parsed = new URL(url, canonical);
  assert.equal(parsed.origin, canonical, "unexpected cross-origin discovery link");
  return new URL(parsed.pathname + parsed.search, base);
}
async function get(path, type, options = {}) {
  const res = await fetch(local(path), { redirect: "error", signal: AbortSignal.timeout(12000), ...options });
  assert.equal(res.status, 200, path + " " + res.status);
  assert.equal(res.headers.get("content-type")?.split(";")[0], type, path);
  return res;
}
const home = await get("/", "text/html");
const html = await home.text();
assert.match(html, /rel="canonical" href="https:\/\/kazuma0129\.work\/"/);
assert.match(home.headers.get("link") ?? "", /<\/\.well-known\/api-catalog>; rel="api-catalog"/);
for (const [accept, type] of [["text/markdown", "text/markdown"], ["text/markdown;q=0, */*", "text/html"], ["text/markdown;q=.4, text/html;q=.8", "text/html"], ["*/*", "text/html"]]) {
  const res = await get("/", type, { headers: { accept } });
  assert.match(res.headers.get("vary") ?? "", /\baccept\b/i);
  assert.match(await res.text(), type === "text/markdown" ? /^# .+\n[\s\S]+## Work Experience/i : /<!doctype html>/i);
}
assert.equal((await (await get("/", "text/markdown", { method: "HEAD", headers: { accept: "text/markdown" } })).text()), "");
const robots = await (await get("/robots.txt", "text/plain")).text();
for (const agent of ["*", "OAI-SearchBot", "Claude-SearchBot", "PerplexityBot", "GPTBot", "ClaudeBot", "Google-Extended"])
  assert.ok(robots.split(/\r?\n/).includes("User-agent: " + agent), agent);
assert.match(robots, /^Content-Signal: search=yes, ai-input=yes, ai-train=yes$/m);
assert.match(robots, /^Sitemap: https:\/\/kazuma0129\.work\/sitemap\.xml$/m);
const sitemap = await (await get("/sitemap.xml", "application/xml")).text();
assert.ok(sitemap.includes("<loc>" + canonical + "/</loc>"));
const { linkset: [api] } = await (await get("/.well-known/api-catalog", "application/linkset+json")).json();
const profile = await (await get(api.anchor, "application/json")).json();
assert.ok(profile.sections.length && profile.sections.every(section => {
  const location = new URL(section.url);
  return location.origin === canonical && location.hash && html.includes('id="' + location.hash.substring(1) + '"');
}));
for (const rel of ["service-doc", "service-desc", "status"]) {
  const [link] = api[rel];
  await get(link.href, link.type);
}
const ard = await get("/.well-known/ai-catalog.json", "application/json");
assert.equal(ard.headers.get("access-control-allow-origin"), "*");
const { entries } = await ard.json();
for (const entry of entries) {
  assert.ok(entry.url && !("data" in entry) && entry.identifier.startsWith("urn:air:kazuma0129.work:"));
  assert.ok(entry.representativeQueries.length >= 2 && entry.representativeQueries.length <= 5);
  await get(entry.url, entry.type);
}
const { skills } = await (await get("/.well-known/agent-skills/index.json", "application/json")).json();
assert.ok(skills.length);
for (const skill of skills) {
  const file = await (await get(skill.url, "text/markdown")).arrayBuffer();
  assert.equal("sha256:" + createHash("sha256").update(Buffer.from(file)).digest("hex"), skill.digest);
}
const mcp = await (await get("/.well-known/mcp/server-card.json", "application/json")).json();
const card = await (await get("/mcp/server-card", "application/mcp-server-card+json")).json();
assert.equal(mcp.transport.endpoint, card.remotes[0].url);
async function rpc(id, method, params) {
  const response = await get(mcp.transport.endpoint, "application/json", { method: "POST",
    headers: { "content-type": "application/json", accept: "application/json, text/event-stream" },
    body: JSON.stringify({ jsonrpc: "2.0", id, method, params }) });
  const payload = await response.json();
  assert.equal(payload.id, id);
  assert.ok(payload.result, method + " failed");
  return payload.result;
}
const init = await rpc(1, "initialize", { protocolVersion: "2025-11-25", capabilities: {}, clientInfo: { name: "discovery-check", version: "1.0.0" } });
assert.deepEqual(init.serverInfo, mcp.serverInfo);
assert.deepEqual(init.capabilities.tools, mcp.capabilities.tools);
const { tools: [tool] } = await rpc(2, "tools/list", {});
assert.equal(tool.name, "list_portfolio_sections");
const compatibility = await (await get("/.well-known/mcp.json", "application/json")).json();
assert.equal(compatibility.url, mcp.transport.endpoint);
assert.deepEqual(compatibility.tools, [{ name: tool.name, description: tool.description, input_schema: tool.inputSchema }]);
const result = await rpc(3, "tools/call", { name: tool.name, arguments: {} });
assert.deepEqual(JSON.parse(result.content[0].text), profile);
console.log(base.origin + ": verified HTML/Markdown negotiation, robots, sitemap, catalogs, skill digest, and MCP tool output (" + profile.sections.length + " sections).");
