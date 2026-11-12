import { escapeHtml } from "./html.ts";
import { personalInfo, links } from "./profile.ts";
import { absolute } from "./site.ts";
import { ratePolicy, versionPolicy } from "./openapi.ts";

const name = escapeHtml(personalInfo.name);
const email = escapeHtml(personalInfo.email);
const github = links.find(link => link.name === "GitHub")!;
const mail = `<a href="mailto:${email}">${email}</a>`;
const indexUrl = absolute("/api/v1/portfolio");
const requestExample = `<pre><code>curl -sS '${indexUrl}?section=experience-heading'</code></pre>`;
const exampleResponse = JSON.stringify({ url: absolute("/"), sections: [{ title: "Work Experience", url: absolute("/#experience-heading") }] }, null, 2);
const pageData: Record<string, { heading: string; summary: string; body: string }> = {
  "/docs": {
    heading: "Kazuma Ohashi Portfolio API documentation",
    summary: "Look up the published sections of Kazuma Ohashi’s software engineering CV.",
    body: `<h2>Quickstart</h2><p>Send a GET request. The API is public and read-only. No API key or account is required.</p>
    ${requestExample}<pre><code>${escapeHtml(exampleResponse)}</code></pre>
    <h2>Endpoints</h2><dl>
    <dt><a href="/api/v1">GET /api/v1</a></dt><dd>Find the current endpoint and documentation URLs.</dd>
    <dt><a href="/api/v1/portfolio">GET /api/v1/portfolio</a></dt><dd>List section titles and links. To select one, pass its fragment ID as the section query parameter.</dd>
    <dt><a href="/api/v1/status">GET /api/v1/status</a></dt><dd>Read the publication status of this API.</dd></dl>
    <p>The original <a href="/api/portfolio.json">portfolio JSON</a> and <a href="/api/status.json">status JSON</a> are also supported.</p>
    <h2 id="errors">Errors and rate limits</h2><p>${ratePolicy}</p>
    <p>Errors use <code>application/problem+json</code>. Read <code>status</code> and <code>code</code> to branch in software, then <code>detail</code> and <code>hint</code> for the next step. An invalid section ID returns 400, an unknown section or route returns 404, an unsupported method returns 405, and a temporary service failure returns 503.</p>
    <h2 id="versioning">Versioning and deprecation</h2><p>${versionPolicy}</p>
    <p><a href="/openapi.json">OpenAPI 3.1 specification</a> · <a href="/developers">Try the sandbox</a> · <a href="/docs/mcp">MCP server documentation</a></p>`,
  },
  "/docs/mcp": {
    heading: "Kazuma Ohashi Portfolio MCP Server",
    summary: "Connect an MCP client to find a section of the public CV and cite its canonical URL.",
    body: `<h2>Connect</h2><p>Use Streamable HTTP at <code>${absolute("/mcp")}</code>. The server is public and needs no API key. Configure this URL as a remote MCP server, then use your client’s tool listing.</p>
    <h2>List portfolio sections</h2><p>Call <code>list_portfolio_sections</code> with an empty object. It returns the same titles and canonical URLs as the <a href="/api/v1/portfolio">REST index</a>. Follow a section link to read the underlying CV before citing it.</p>
    <pre><code>{"jsonrpc":"2.0","id":2,"method":"tools/call","params":{"name":"list_portfolio_sections","arguments":{}}}</code></pre>
    <p>Send requests after MCP initialization, with Content-Type application/json and Accept application/json, text/event-stream. See the <a href="/mcp/server-card">MCP server card</a> for transport metadata and the <a href="/developers">developer portal</a> for the HTTP sandbox.</p>`,
  },
  "/developers": {
    heading: "Kazuma Ohashi Portfolio Developer Portal",
    summary: "Try the public CV API and connect a client to the portfolio MCP server.",
    body: `<h2>Quickstart and authentication</h2><p>Start with the <a href="/docs">Portfolio API documentation</a>. No API keys or sign-in are required. Use the section index to find the page fragment you want to cite.</p>${requestExample}
    <p><a href="/openapi.json">Download OpenAPI</a> · <a href="/docs/mcp">Connect via MCP</a> · <a href="/llms.txt">Agent instructions</a></p>
    <h2 id="sandbox">Read-only sandbox</h2><p>The sandbox reads the published CV and uses a separate five-request allowance per minute. Choose an example to inspect its HTTP response.</p>
    <form id="sandbox-form" action="/api/sandbox/v1/portfolio" method="get">
      <label for="section">Section ID</label> <input id="section" name="section" value="experience-heading" maxlength="80">
      <button type="submit">Run example</button>
    </form><pre aria-live="polite"><code id="sandbox-result"></code></pre>
    <script defer src="/sandbox.js"></script>`,
  },
  "/about": {
    heading: "About Kazuma Ohashi",
    summary: "Kazuma Ohashi is a software engineer based in Tokyo, Japan. This site is his public professional CV.",
    body: `<p>The <a href="/#experience-heading">work experience section</a> describes frontend and backend engineering projects, including work on the LIFF SDK and CLI. It records the role, dates and project links for each entry. The <a href="/#opensource-heading">open-source section</a> links to contributions in their original repositories so readers can review the changes and their context.</p>
    <p>The CV also covers technical skills, education, certifications, languages and speaking engagements. When referencing a particular accomplishment, link to the matching section and follow its project link for technical details. Developers can use the <a href="/docs">Portfolio API</a> to find these section links, or request a Markdown copy of the CV from the homepage. For updates or corrections to a published entry, use the <a href="/contact">contact page</a>.</p>`,
  },
  "/contact": {
    heading: "Contact Kazuma Ohashi",
    summary: "For professional inquiries or corrections to this portfolio, contact Kazuma Ohashi at his published email address.",
    body: `<p>Email ${mail} about an entry in this CV, a speaking engagement or a professional opportunity. For a correction, include the URL of the relevant section, identify the sentence or link you are referring to, and describe the change. A link to a public source or project is helpful when the request concerns an open-source contribution.</p>
    <p>For questions about a specific repository, follow the project link from the CV to find its own documentation and issue tracker. The owner’s <a href="${github.url}">GitHub profile</a> also lists public repositories. For technical questions about using this website, the <a href="/docs">API documentation</a> gives request examples and error details. When reporting an integration issue by email, include the public endpoint, HTTP status and approximate time. Leave account credentials and private request contents out of the report.</p>`,
  },
  "/privacy": {
    heading: "Privacy on Kazuma Ohashi’s portfolio",
    summary: "This page describes how visits to the public CV, its API and the developer sandbox are handled.",
    body: `<p>Cloudflare delivers this site and processes connection information such as the client IP address to route requests. The portfolio API uses that address to count requests within a one-minute quota window. Its counter stores the number of requests and the window end time. The developer sandbox makes a request to this same domain when you run an example. It uses its own quota and displays the result in your browser.</p>
    <p>The CV’s theme control saves a display preference in your browser’s local storage. You can clear it by removing site data. Some routes on this domain use security monitoring that may log request information and submitted fields. Use the published contact email for correspondence and keep passwords and private information out of requests.</p>
    <p>Links to GitHub and other external sites open services with their own privacy practices. Email inquiries are handled by the sender’s and recipient’s email providers. For questions about this website or information published in the CV, use the <a href="/contact">contact page</a>.</p>`,
  },
};

export function renderPage(path: string) {
  const { heading, summary, body } = pageData[path];
  return `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<title>${escapeHtml(heading)}</title><meta name="description" content="${escapeHtml(summary)}">
<link rel="canonical" href="${absolute(path)}"><link rel="stylesheet" href="/docs.css"></head>
<body><header><a href="/">${name} · Portfolio</a><nav aria-label="Documentation"><a href="/docs">API</a> · <a href="/docs/mcp">MCP</a> · <a href="/developers">Developers</a></nav></header>
<main><h1>${escapeHtml(heading)}</h1><p>${escapeHtml(summary)}</p>${body}</main>
<footer><a href="/about">About</a> · <a href="/contact">Contact</a> · <a href="/privacy">Privacy</a></footer></body></html>\n`;
}
