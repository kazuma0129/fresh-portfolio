export const origin = "https://kazuma0129.work";
export const absolute = (path: string) => new URL(path, origin).href;
export const serverInfo = { name: "work.kazuma0129/portfolio", version: "1.0.0" };
export const skillName = "navigate-portfolio";
export const skillPath = `/.well-known/agent-skills/${skillName}/SKILL.md`;
export const skillDescription = "Use when you need to find or cite Kazuma Ohashi's engineering experience, technical skills or open-source work from his public CV.";
export const sectionTool = {
  name: "list_portfolio_sections",
  description: skillDescription,
  inputSchema: { type: "object" as const, properties: {}, additionalProperties: false },
};
// Editorial revision of the homepage. Keep stable across unrelated builds.
export const homepageModified = "2026-11-12";
export const pagePaths = ["/", "/docs", "/docs/mcp", "/developers", "/about", "/contact", "/privacy"];
export const apiPath = "/api/portfolio.json";
export const apiDocsPath = "/docs/api.md";
export const specPath = "/openapi.json";
export const statusPath = "/api/status.json";
export const catalogPath = "/.well-known/api-catalog";
export const ardPath = "/.well-known/ai-catalog.json";
export const cardPath = "/mcp/server-card";
export const cardType = "application/mcp-server-card+json";
export const homepageLinks = [
  `<${catalogPath}>; rel="api-catalog"; type="application/linkset+json"`,
  `<${apiDocsPath}>; rel="service-doc"; type="text/markdown"`,
  '</docs>; rel="service-doc"; type="text/html"',
  `<${ardPath}>; rel="describedby"; type="application/json"`,
  '</>; rel="alternate"; type="text/markdown"',
].join(", ");
