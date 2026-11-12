import { limits, windowSeconds } from "./quota.ts";
import { absolute, apiPath, origin, statusPath } from "./site.ts";

const text = { type: "string" };
const uri = { type: "string", format: "uri" };
const object = (properties: Record<string, object>) => ({ type: "object", properties, required: Object.keys(properties) });
const section = object({ title: text, url: uri });
const portfolio = object({ url: uri, sections: { type: "array", items: section } });
const status = object({ status: { type: "string", const: "ok" }, service: { type: "string", const: "portfolio-index" } });
const directory = object({ name: text, version: text, documentation: uri, openapi: uri,
  endpoints: object({ portfolio: uri, status: uri }) });

const problemSchema = object({ type: uri, title: text, status: { type: "integer", minimum: 400, maximum: 599 },
  detail: text, instance: { type: "string", format: "uri-reference" }, code: text, message: text, hint: text });
const quotas = {
  "RateLimit-Policy": { description: "Named request quota and window in seconds.", schema: text },
  RateLimit: { description: "Remaining requests and seconds until reset.", schema: text },
};
const retryAfter = { description: "Seconds before another request.", schema: { type: "integer", minimum: 1 } };
function failure(description: string, headers: Record<string, object> = quotas) {
  return { description, headers, content: { "application/problem+json": { schema: { $ref: "#/components/schemas/Problem" } } } };
}
const filter = { name: "section", in: "query", required: false,
  description: "The HTML fragment ID of a CV section. Omit it to list every section.",
  schema: { type: "string", pattern: "^[a-z][a-z0-9-]{0,79}$" }, example: "experience-heading" };
function read(operationId: string, summary: string, description: string, schema: object, filtered = false) {
  return { get: { operationId, summary, description, security: [], parameters: filtered ? [filter] : [],
    responses: {
      "200": { description: summary, headers: quotas, content: { "application/json": { schema } } },
      ...(filtered ? { "400": failure("Invalid section ID."), "404": failure("Unknown section ID.") } : {}),
      "405": failure("Unsupported method.", { ...quotas, Allow: { schema: text } }),
      "429": failure("Quota exhausted.", { ...quotas, "Retry-After": retryAfter }),
      "503": failure("Temporary service interruption.", { "Retry-After": retryAfter }),
    },
  } };
}

export const versionPolicy = "Breaking changes receive a new major URL, such as /api/v2. When a version is deprecated, its responses will carry a Deprecation date and a Link with rel=deprecation to migration instructions. If a retirement date is set, a Sunset header will give the HTTP date. The original JSON endpoints remain supported.";
export const ratePolicy = `The public API accepts ${limits.public} requests per client IP per ${windowSeconds}-second window. The sandbox has a separate allowance of ${limits.sandbox} per minute. RateLimit-Policy describes the limit; RateLimit reports remaining requests (r) and seconds to reset (t). On HTTP 429, wait the Retry-After interval before trying again.`;

export function openApi() {
  return { openapi: "3.1.0", info: { title: "Kazuma Ohashi Portfolio API", version: "1.0.0",
    description: "Read the public software engineering CV and its canonical section links. " + versionPolicy,
    contact: { name: "Kazuma Ohashi", url: absolute("/contact") } },
    servers: [{ url: origin }], externalDocs: { url: absolute("/docs") }, security: [],
    paths: {
      "/api/v1": read("getApiDirectory", "Read the API directory", "Discover documentation and canonical endpoints.", directory),
      "/api/v1/portfolio": read("listPortfolioSections", "List CV sections", "Return canonical links to the CV, optionally selecting one section by its HTML fragment.", portfolio, true),
      "/api/v1/status": read("getPublicationStatus", "Read publication status", "Check that this API can serve the published status document.", status),
      [apiPath]: read("listPortfolioSectionsLegacy", "List all sections at the original URL", "Read the original, unfiltered section index.", portfolio),
      [statusPath]: read("getPublicationStatusLegacy", "Read the original status document", "Get the publication status at its original URL.", status),
    }, components: { schemas: { Problem: problemSchema } },
  };
}
