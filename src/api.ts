import type { DurableObjectNamespace } from "@cloudflare/workers-types";
import { consume } from "./quota.ts";
import { absolute, apiPath, statusPath } from "./site.ts";

export interface Assets { fetch(request: Request): Promise<Response> }
export interface Env { ASSETS: Assets; API_QUOTA: DurableObjectNamespace }

export function problem(request: Request, status: number, code: string, title: string, detail: string, hint: string) {
  return Response.json({ type: "about:blank", title, status, detail, code, message: detail, hint,
    instance: new URL(request.url).pathname }, {
    status, headers: { "Content-Type": "application/problem+json", "Cache-Control": "no-store" },
  });
}

interface Section { title: string; url: string }
interface Portfolio { url: string; sections: Section[] }

async function readAsset(env: Env, request: Request, path: string) {
  const response = await env.ASSETS.fetch(new Request(new URL(path, request.url)));
  if (!response.ok) throw new Error("API asset unavailable");
  return response;
}

async function route(request: Request, env: Env, path: string, root: string) {
  if (!["GET", "HEAD"].includes(request.method)) {
    const error = problem(request, 405, "method_not_allowed", "Method Not Allowed",
      "This read-only API accepts GET and HEAD.", "Repeat the request with GET.");
    error.headers.set("Allow", "GET, HEAD");
    return error;
  }
  const url = new URL(request.url);
  if (path === "/api" || path === root) {
    return Response.json({ name: "Kazuma Ohashi Portfolio API", version: "v1", documentation: absolute("/docs"),
      openapi: absolute("/openapi.json"), endpoints: { portfolio: absolute(root + "/portfolio"), status: absolute(root + "/status") } });
  }
  if (path === root + "/status" || path === statusPath) return readAsset(env, request, statusPath);
  if (path === root + "/portfolio" || path === apiPath) {
    const asset = await readAsset(env, request, apiPath);
    // Older clients may attach tracking parameters to the original JSON file.
    if (path === apiPath || !url.searchParams.has("section")) return asset;
    const values = url.searchParams.getAll("section");
    if (values.length !== 1 || !/^[a-z][a-z0-9-]{0,79}$/.test(values[0]))
      return problem(request, 400, "invalid_section", "Bad Request", "Supply one section ID using lowercase letters, digits or hyphens.",
        "Omit the section parameter to list all sections.");
    const index: Portfolio = await asset.json();
    const sections = index.sections.filter(section => new URL(section.url).hash.slice(1) === values[0]);
    if (sections.length) return Response.json({ ...index, sections });
    return problem(request, 404, "section_not_found", "Not Found", "The CV has no section with that ID.",
      "GET /api/v1/portfolio and use a fragment from one of its URLs.");
  }
  return problem(request, 404, "endpoint_not_found", "Not Found", "This API endpoint does not exist.",
    "GET /api/v1 to find the supported endpoints, or visit /docs.");
}

export async function handleApi(request: Request, env: Env) {
  const path = new URL(request.url).pathname.replace(/\/$/, "");
  const sandbox = path === "/api/sandbox" || path.startsWith("/api/sandbox/");
  let response: Response;
  let headers: Headers | undefined;
  try {
    const quota = await consume(env.API_QUOTA, request, sandbox ? "sandbox" : "public");
    headers = quota.headers;
    if (quota.allowed) {
      response = await route(request, env, path, sandbox ? "/api/sandbox/v1" : "/api/v1");
    } else {
      response = problem(request, 429, "quota_exhausted", "Too Many Requests",
        "The request quota for this window has been used.", "Wait the number of seconds in Retry-After before retrying.");
      headers.set("Retry-After", String(quota.reset));
    }
  } catch {
    response = problem(request, 503, "temporarily_unavailable", "Service Unavailable",
      "The portfolio API is temporarily unavailable.", "Retry after the delay in Retry-After.");
    response.headers.set("Retry-After", "60");
  }
  const result = new Response(request.method === "HEAD" ? null : response.body, response);
  headers?.forEach((value, name) => result.headers.set(name, value));
  result.headers.set("Cache-Control", "no-store");
  result.headers.set("Link", '</docs>; rel="service-doc", </openapi.json>; rel="service-desc"');
  return result;
}
