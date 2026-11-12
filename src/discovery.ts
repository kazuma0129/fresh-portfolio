import { createHash } from "node:crypto";
import { parseHTML } from "linkedom";
import TurndownService from "turndown";
import { absolute, apiDocsPath, apiPath, ardPath, cardPath, cardType, catalogPath, origin, serverInfo, skillDescription, skillName, skillPath, specPath, statusPath } from "./site.ts";

const json = (value: unknown) => JSON.stringify(value, null, 2) + "\n";
export const legacyCardPath = "/.well-known/mcp/server-card.json";
export const skillsIndex = "/.well-known/agent-skills/index.json";

export function renderDiscovery(html: string, publicPages: string[]): Record<string, string> {
  const { document } = parseHTML(html);
  const sections = [...document.querySelectorAll("main h2[id]")].map(h => ({
    title: h.textContent!.trim(), url: absolute("/#" + h.id),
  }));
  // Convert only the published CV. Omit controls and duplicate accessibility hints.
  const page = document.querySelector(".page")!;
  page.querySelectorAll("button, .profile-actions, .sr-only, footer").forEach(n => n.remove());
  const markdown = new TurndownService({ headingStyle: "atx" }).turndown(page.innerHTML) + "\n";
  const detail = { url: absolute("/"), sections };
  const skill = `---
name: ${skillName}
description: "${skillDescription}"
---

# Navigate the public portfolio

Fetch [the section index](${absolute(apiPath)}) and select a section by its title.
Use the URL returned for that section as a citation. To read its content, fetch
[the public CV](${absolute("/")}) with \`Accept: text/markdown\`. Only cite facts
present on the page. No sign-in, account creation, or API key is required.
`;
  const card = {
    $schema: "https://static.modelcontextprotocol.io/schemas/v1/server-card.schema.json",
    ...serverInfo, title: "Portfolio navigation",
    description: skillDescription, websiteUrl: absolute("/"),
    remotes: [{ type: "streamable-http", url: absolute("/mcp") }],
  };
  const entry = (id: string, displayName: string, type: string, path: string, queries: string[]) => ({
    identifier: "urn:air:" + new URL(origin).hostname + ":" + id, displayName, type, url: absolute(path),
    representativeQueries: queries,
  });
  const get = (summary: string, operationId: string, schema: object) => ({
    get: { operationId, summary, responses: { "200": { description: summary, content: { "application/json": { schema } } } } },
  });
  const link = { type: "string", format: "uri" };
  return {
    "/portfolio.md": markdown,
    [apiPath]: json(detail),
    [statusPath]: json({ status: "ok", service: "portfolio-index" }),
    [apiDocsPath]: `# Public portfolio API

GET [the section index](${absolute(apiPath)}) to list section titles and canonical links.
GET [the status document](${absolute(statusPath)}) to check that the published API assets are available.
Both return JSON. This API only reads the public site and requires no credentials.

The [OpenAPI description](${absolute(specPath)}) documents both operations.
MCP clients can connect to [the Streamable HTTP endpoint](${absolute("/mcp")}) and call
\`list_portfolio_sections\` to read the same index.
`,
    [specPath]: json({ openapi: "3.1.0", info: { title: "Public portfolio index", version: serverInfo.version },
      servers: [{ url: origin }], paths: {
        [apiPath]: get("List published CV sections", "listPortfolioSections", {
          type: "object", required: ["url", "sections"], properties: { url: link, sections: {
            type: "array", items: { type: "object", required: ["title", "url"], properties: { title: { type: "string" }, url: link } },
          } },
        }),
        [statusPath]: get("Read the deployment status document", "getPublicationStatus", {
          type: "object", required: ["status", "service"], properties: { status: { const: "ok" }, service: { const: "portfolio-index" } },
        }),
      } }),
    [catalogPath]: json({ linkset: [{ anchor: absolute(apiPath),
      "service-desc": [{ href: absolute(specPath), type: "application/json" }],
      "service-doc": [{ href: absolute(apiDocsPath), type: "text/markdown" }],
      status: [{ href: absolute(statusPath), type: "application/json" }],
    }] }),
    [cardPath]: json(card),
    [legacyCardPath]: json({ serverInfo, transport: { type: "streamable-http", endpoint: absolute("/mcp") }, capabilities: { tools: {} } }),
    [skillPath]: skill,
    [skillsIndex]: json({ $schema: "https://schemas.agentskills.io/discovery/0.2.0/schema.json", skills: [{
      name: skillName, description: skillDescription, type: "skill-md", url: skillPath,
      digest: "sha256:" + createHash("sha256").update(skill).digest("hex"),
    }] }),
    [ardPath]: json({ specVersion: "1.0", host: { displayName: "Kazuma Ohashi's portfolio", identifier: absolute("/") },
      entries: [
        entry("mcp:portfolio", "Portfolio navigation", cardType, cardPath, ["Where is the MCP endpoint for this CV?", "How can I list portfolio sections via MCP?"]),
        entry("api:portfolio", "Portfolio API description", "application/json", specPath, ["How do I fetch the public section index?", "Where can I check that the index is available?"]),
        entry("skill:navigate-portfolio", "Navigate the portfolio", "text/markdown", skillPath, ["How do I cite a CV section?", "How can I read the CV as Markdown?"]),
      ],
    }),
    "/sitemap.xml": `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${publicPages.map(path => "  <url><loc>" + absolute(path).replaceAll("&", "&amp;") + "</loc></url>").join("\n")}\n</urlset>\n`,
    "/robots.txt": [
      // Specific user-agent groups do not inherit wildcard rules (RFC 9309).
      ...["*", "OAI-SearchBot", "Claude-SearchBot", "PerplexityBot", "GPTBot", "ClaudeBot", "Google-Extended", "Applebot-Extended", "CCBot", "Bytespider", "Amazonbot"].map(agent => "User-agent: " + agent),
      "Allow: /", "Disallow: /admin", "Disallow: /wp-admin", "Disallow: /cdn-cgi/",
      "Content-Signal: search=yes, ai-input=yes, ai-train=yes", "", "Sitemap: " + absolute("/sitemap.xml"), "",
    ].join("\n"),
    "/_headers": Object.entries({
      "/robots.txt": "text/plain", "/sitemap.xml": "application/xml", "/portfolio.md": "text/markdown",
      [apiDocsPath]: "text/markdown", [skillPath]: "text/markdown", [catalogPath]: "application/linkset+json",
      [ardPath]: "application/json", [cardPath]: cardType, [legacyCardPath]: "application/json",
    }).map(([path, type]) => `${path}\n  Content-Type: ${type}; charset=utf-8${[ardPath, cardPath, legacyCardPath, skillPath, skillsIndex].includes(path) ? "\n  Access-Control-Allow-Origin: *" : ""}`).concat(`${skillsIndex}\n  Access-Control-Allow-Origin: *`).join("\n\n") + "\n",
  };
}
