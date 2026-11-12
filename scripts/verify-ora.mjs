import assert from "node:assert/strict";
import Ajv2020 from "ajv/dist/2020.js";
import addFormats from "ajv-formats";
import { parseHTML, DOMParser } from "linkedom";

const base = new URL(process.argv[2] ?? "https://kazuma0129.work");
const origin = "https://kazuma0129.work";
const pagePaths = ["/", "/docs", "/docs/mcp", "/developers", "/about", "/contact", "/privacy"];
async function http(path, status = 200, type, options = {}) {
  const response = await fetch(new URL(path, base), { redirect: "manual", signal: AbortSignal.timeout(15000), ...options });
  assert.equal(response.status, status, path + " status");
  if (type) assert.equal(response.headers.get("content-type")?.split(";")[0], type, path + " media type");
  return response;
}
const md = { headers: { accept: "text/markdown" } };
const probe = "/__ora-verification-" + Date.now();
const missing = await http(probe, 404, "text/markdown", md);
assert.match(missing.headers.get("vary"), /accept/i);
const body = await missing.text();
assert.match(body, /^# .+\n\n.{20,}\[(?:API documentation|sitemap)\]\(\/(?:docs|sitemap\.xml)\)/s);
assert.equal(await (await http(probe, 404, "text/markdown", { ...md, method: "HEAD" })).text(), "");
await http(probe, 404, undefined, { headers: { accept: "text/html" } });

const sitemap = await (await http("/sitemap.xml", 200, "application/xml")).text();
const xml = new DOMParser().parseFromString(sitemap, "text/xml");
assert.deepEqual([...xml.querySelectorAll("url > loc")].map(loc => loc.textContent).sort(), pagePaths.map(p => origin + p).sort());
const home = parseHTML(await (await http("/", 200, "text/html")).text()).document;
const jsonLd = JSON.parse(home.querySelector('script[type="application/ld+json"]').textContent);
assert.equal(jsonLd["@type"], "Person");
assert.equal(jsonLd.name, "Kazuma Ohashi");
assert.ok(jsonLd.sameAs.includes("https://github.com/kazuma0129"));
assert.ok(jsonLd.contactPoint.email && jsonLd.contactPoint.contactType && jsonLd.address.addressLocality);
assert.ok(home.querySelector("title").textContent.includes("Software Engineering Portfolio"));
assert.match(home.querySelector('meta[name="keywords"]').content, /Portfolio API/);
for (const path of pagePaths.slice(1)) {
  assert.ok(home.querySelector(`a[href="${path}"]`), "Homepage links to " + path);
  const doc = parseHTML(await (await http(path, 200, "text/html")).text()).document;
  assert.equal(doc.querySelector('link[rel="canonical"]').href, origin + path);
  const heading = doc.querySelector("h1").textContent;
  assert.equal(doc.title, heading);
  const main = doc.querySelector("main");
  if (["/about", "/contact", "/privacy"].includes(path)) assert.ok(main.textContent.trim().length >= 500, path);
  const markdown = await (await http(path, 200, "text/markdown", md)).text();
  assert.ok(markdown.startsWith("# " + heading));
  assert.equal(markdown, await (await http(path + ".md", 200, "text/markdown")).text());
  if (path === "/docs") {
    assert.match(heading, /Kazuma Ohashi.*API/);
    assert.match(main.textContent, /Deprecation.*Sunset/s);
    assert.match(main.textContent, /No API key/);
    assert.equal(markdown, await (await http("/docs/api.md", 200, "text/markdown")).text());
  }
  if (path === "/docs/mcp") assert.match(heading, /Kazuma Ohashi.*MCP Server/);
  if (path === "/developers") assert.ok(main.querySelector('form[action="/api/sandbox/v1/portfolio"]'));
}
const instructions = await (await http("/llms.txt", 200, "text/plain")).text();
assert.match(instructions, /^# Kazuma Ohashi[\s\S]+## When to use[\s\S]+list_portfolio_sections/);
for (const match of instructions.matchAll(/\]\((https:\/\/[^)]+)\)/g)) {
  const url = new URL(match[1]);
  assert.equal(url.origin, origin);
  await http(url.pathname);
}
const { skills: [skill] } = await (await http("/.well-known/agent-skills/index.json")).json();
assert.match(skill.description, /use when/i);
assert.match(await (await http(skill.url)).text(), /## When to use/);
for (const path of ["/docs.css", "/sandbox.js", "/favicon.svg", "/manifest.json", "/styles.css"]) await http(path);
assert.equal((await http("/mcp", 303, undefined, { headers: { accept: "text/html" } })).headers.get("location"), "/docs/mcp");
await http("/mcp", 405, undefined, { headers: { accept: "text/event-stream" } });
const spec = await (await http("/openapi.json", 200, "application/json")).json();
const validator = new Ajv2020({ allErrors: true });
addFormats(validator);
const problem = validator.compile(spec.components.schemas.Problem);
const operationIds = new Set();
for (const [path, { get }] of Object.entries(spec.paths)) {
  assert.ok(get.description && get.operationId && !operationIds.has(get.operationId), path);
  operationIds.add(get.operationId);
  const schema = get.responses["200"].content["application/json"].schema;
  const validate = validator.compile(schema);
  const res = await http(path, 200, "application/json");
  const data = await res.json();
  assert.ok(validate(data), path + " " + validator.errorsText(validate.errors));
  assert.match(res.headers.get("ratelimit-policy"), /"public";q=120;w=60/);
  assert.match(res.headers.get("ratelimit"), /"public";r=\d+;t=\d+/);
  for (const status of [405, 429, 503]) assert.equal(get.responses[status].content["application/problem+json"].schema.$ref, "#/components/schemas/Problem");
}
const directory = await (await http("/api", 200, "application/json")).json();
assert.equal(directory.endpoints.portfolio, origin + "/api/v1/portfolio");
const all = await (await http("/api/v1/portfolio")).json();
assert.deepEqual(await (await http("/api/portfolio.json")).json(), all);
const filtered = await (await http("/api/v1/portfolio?section=experience-heading")).json();
assert.equal(filtered.sections.length, 1);
assert.equal(filtered.sections[0].title, "Work Experience");
assert.equal(await (await http("/api/v1/status", 200, "application/json", { method: "HEAD" })).text(), "");
for (const [path, status, code, method] of [
  ["/api/v1" + probe, 404, "endpoint_not_found", "GET"], ["/api/v1/portfolio?section=missing", 404, "section_not_found", "GET"],
  ["/api/v1/portfolio?section=", 400, "invalid_section", "GET"], ["/api/v1/portfolio?section=a&section=b", 400, "invalid_section", "GET"],
  ["/api/v1/status", 405, "method_not_allowed", "POST"],
]) {
  const response = await http(path, status, "application/problem+json", { method });
  const error = await response.json();
  assert.ok(problem(error), validator.errorsText(problem.errors));
  assert.equal(error.status, status);
  assert.equal(error.code, code);
  assert.ok(error.hint);
  if (status === 405) assert.equal(response.headers.get("allow"), "GET, HEAD");
}
const sandbox = "/api/sandbox/v1";
const testDirectory = await fetch(new URL(sandbox, base));
if (testDirectory.ok) assert.equal((await testDirectory.json()).endpoints.portfolio, origin + sandbox + "/portfolio");
let exhausted = false;
for (let i = 0; i < 12; i++) {
  const path = sandbox + (i % 2 === 0 ? "/portfolio" : "/status");
  const res = await fetch(new URL(path, base), { signal: AbortSignal.timeout(10000) });
  assert.match(res.headers.get("ratelimit-policy"), /"sandbox";q=5;w=60/);
  if (res.status === 429) {
    assert.equal(res.headers.get("content-type")?.split(";")[0], "application/problem+json");
    const error = await res.json();
    assert.ok(problem(error) && error.status === 429 && error.code === "quota_exhausted");
    assert.match(res.headers.get("ratelimit"), /;r=0;/);
    const delay = Number(res.headers.get("retry-after"));
    assert.ok(delay >= 1 && delay <= 60);
    exhausted = true;
    break;
  }
  assert.equal(res.status, 200, path);
  const data = await res.json();
  if (path.endsWith("portfolio")) assert.deepEqual(data, all);
  else assert.equal(data.status, "ok");
}
assert.ok(exhausted, "Sandbox actually enforces its advertised quota");
await http("/api/v1/status", 200, "application/json");
console.log(base.origin + ": verified 7 canonical pages, Markdown 404, JSON-LD, instructions, API schemas, errors, versioned and legacy routes, sandbox quota and Retry-After.");
