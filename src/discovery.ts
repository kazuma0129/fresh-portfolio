import { createHash } from "node:crypto";
import { parseHTML } from "linkedom";
import TurndownService from "turndown";
import { openApi } from "./openapi.ts";
import { homepageModified, sectionTool } from "./site.ts";
import { absolute, apiDocsPath, apiPath, ardPath, cardPath, cardType, catalogPath, origin, serverInfo, skillDescription, skillName, skillPath, specPath, statusPath } from "./site.ts";

const json = (value: unknown) => JSON.stringify(value, null, 2) + "\n";
export const legacyCardPath = "/.well-known/mcp/server-card.json";
export const skillsIndex = "/.well-known/agent-skills/index.json";

export function articleMarkdown(html: string) {
  const main = parseHTML(html).document.querySelector("main")!;
  main.querySelectorAll("form, script, #sandbox-result").forEach(el => el.remove());
  return new TurndownService({ headingStyle: "atx" }).turndown(main.innerHTML) + "\n";
}

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

## When to use this skill

Use this skill when finding evidence for Kazuma Ohashi's engineering experience,
open-source work or technical skills, or when you need a canonical link to cite.

Fetch [the section index](${absolute(apiPath)}) and select a section by its title.
Use the URL returned for that section as a citation. To read its content, fetch
[the public CV](${absolute("/")}) with \`Accept: text/markdown\`. Only cite facts
present on the page. No sign-in, account creation, or API key is required.
`;
  const card = {
    $schema: "https://static.modelcontextprotocol.io/schemas/v1/server-card.schema.json",
    ...serverInfo, title: "Portfolio navigation",
    description: "Find canonical links to sections of Kazuma Ohashi's public CV.", websiteUrl: absolute("/"),
    remotes: [{ type: "streamable-http", url: absolute("/mcp") }],
  };
  const entry = (id: string, displayName: string, type: string, path: string, queries: string[]) => ({
    identifier: "urn:air:" + new URL(origin).hostname + ":" + id, displayName, type, url: absolute(path),
    representativeQueries: queries,
  });
  return {
    "/portfolio.md": markdown,
    [apiPath]: json(detail),
    [statusPath]: json({ status: "ok", service: "portfolio-index" }),
    ["/llms.txt"]: `# Kazuma Ohashi — Software Engineering Portfolio

> Public engineering CV with a read-only API and MCP server for locating and citing CV sections.

## When to use this site

Use the portfolio to check Kazuma Ohashi's published work experience, open-source contributions and technical skills. Fetch the CV with Accept: text/markdown to read the source. Use GET /api/v1/portfolio for canonical links, or call list_portfolio_sections with {} after connecting to the MCP server.

## Documentation

- [Portfolio CV](${absolute("/portfolio.md")}): Read the public profile.
- [API reference](${absolute("/docs.md")}): Requests, authentication, errors and version policy.
- [MCP server](${absolute("/docs/mcp.md")}): Connect and call the section lookup tool.
- [Developer portal](${absolute("/developers")}): Try a request in the read-only sandbox.
- [OpenAPI](${absolute(specPath)}): Typed API operations and response schemas.

## Contact

- [About](${absolute("/about.md")}): Scope of the portfolio.
- [Contact](${absolute("/contact.md")}): Ask a professional question or suggest a correction.
- [Privacy](${absolute("/privacy.md")}): How the site handles requests.
`,
    [specPath]: json(openApi()),
    [catalogPath]: json({ linkset: [{ anchor: absolute("/api/v1/portfolio"),
      "service-desc": [{ href: absolute(specPath), type: "application/json" }],
      "service-doc": [{ href: absolute("/docs"), type: "text/html" }, { href: absolute(apiDocsPath), type: "text/markdown" }],
      status: [{ href: absolute("/api/v1/status"), type: "application/json" }],
    }] }),
    [cardPath]: json(card),
    // Compatibility manifest for clients that use this pre-standard discovery URL.
    "/.well-known/mcp.json": json({
      schema_version: "1.0", name: serverInfo.name, version: serverInfo.version, description: card.description,
      url: absolute("/mcp"), transport: "streamable-http",
      tools: [{ name: sectionTool.name, description: sectionTool.description, input_schema: sectionTool.inputSchema }],
    }),
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
    "/sitemap.xml": `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${publicPages.map(path => `  <url><loc>${absolute(path).replaceAll("&", "&amp;")}</loc>${path === "/" ? `<lastmod>${homepageModified}</lastmod>` : ""}</url>`).join("\n")}\n</urlset>\n`,
    "/robots.txt": [
      // Specific user-agent groups do not inherit wildcard rules (RFC 9309).
      ...["*", "OAI-SearchBot", "ChatGPT-User", "Claude-SearchBot", "Claude-User", "PerplexityBot", "Perplexity-User",
        "GPTBot", "ClaudeBot", "Claude-Web", "anthropic-ai", "Google-Extended", "Applebot-Extended", "CCBot", "Bytespider", "Amazonbot"].map(agent =>
        ["User-agent: " + agent, "Allow: /",
          "Content-Signal: search=yes, ai-input=yes, ai-train=yes", ""].join("\n")),
      "Sitemap: " + absolute("/sitemap.xml"), "",
    ].join("\n"),
    "/_headers": Object.entries({
      "/robots.txt": "text/plain", "/sitemap.xml": "application/xml", "/portfolio.md": "text/markdown",
      "/llms.txt": "text/plain", ...Object.fromEntries(publicPages.filter(path => path !== "/").map(path => [path + ".md", "text/markdown"])),
      [apiDocsPath]: "text/markdown", [skillPath]: "text/markdown", [catalogPath]: "application/linkset+json",
      [ardPath]: "application/json", [cardPath]: cardType, [legacyCardPath]: "application/json",
    }).map(([path, type]) => `${path}\n  Content-Type: ${type}; charset=utf-8${[ardPath, cardPath, legacyCardPath, skillPath, skillsIndex].includes(path) ? "\n  Access-Control-Allow-Origin: *" : ""}`).concat(`${skillsIndex}\n  Access-Control-Allow-Origin: *`).join("\n\n") + "\n",
  };
}
