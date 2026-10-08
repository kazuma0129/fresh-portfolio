/** Low-interaction decoys for paths observed in Cloudflare traffic analytics. */
export const honeypotPaths = [
  "/wp",
  "/admin",
  "/index.php",
  "/blog",
  "/1.php",
  "/wp-content/plugins/index.php",
  "/.env",
] as const;

type HoneypotPath = (typeof honeypotPaths)[number];

export interface Env {
  ASSETS: { fetch(request: Request): Promise<Response> };
}

type EdgeRequest = Request & {
  cf?: { country?: string; asn?: number; colo?: string };
};

function normalizePath(pathname: string): string {
  try {
    return decodeURIComponent(pathname).replace(/\/{2,}/g, "/").toLowerCase();
  } catch {
    return pathname;
  }
}

export function matchHoneypot(pathname: string): HoneypotPath | undefined {
  const normalized = normalizePath(pathname);
  return honeypotPaths.find(
    (path) => normalized === path || normalized.startsWith(`${path}/`),
  );
}

// Bound attacker-controlled values and remove control characters from log fields.
function logValue(value: string | null | undefined, limit: number): string | null {
  return value == null ? null : value.replace(/[\u0000-\u001f\u007f]/g, "").slice(0, limit);
}

function decoyBody(path: HoneypotPath, isStatus: boolean): string {
  if (path === "/.env") {
    // Deliberately synthetic configuration, with no credentials or working services.
    return "APP_NAME=Portfolio\nAPP_ENV=production\nAPP_DEBUG=false\n";
  }

  const title = isStatus ? "Service status" : "Maintenance";
  const message = isStatus
    ? "The service is temporarily unavailable."
    : "This service is undergoing maintenance. Please check the service status.";
  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta name="robots" content="noindex, nofollow, noarchive">
  <title>${title}</title>
</head>
<body>
  <main>
    <h1>${title}</h1>
    <p>${message}</p>
    ${isStatus ? "" : '<p><a href="/admin/status">Service status</a></p>'}
  </main>
</body>
</html>`;
}

export default {
  async fetch(request: EdgeRequest, env: Env): Promise<Response> {
    const url = new URL(request.url);
    const trap = matchHoneypot(url.pathname);
    if (!trap) return env.ASSETS.fetch(request);

    const requestId = crypto.randomUUID();
    const isStatus = normalizePath(url.pathname).replace(/\/$/, "") === "/admin/status";
    const readable = request.method === "GET" || request.method === "HEAD";
    const status = readable ? 200 : 405;

    // This only records requests reaching this Worker; WAF-blocked requests stay
    // in Security Events. IP identifies the connecting client/proxy, not a person.
    // Never read or log bodies, cookies, authorization, or query-string values.
    console.log({
      event: "honeypot.request",
      schemaVersion: 1,
      requestId,
      timestamp: new Date().toISOString(),
      trap,
      stage: isStatus ? "followup" : "entry",
      method: logValue(request.method, 16),
      hostname: logValue(url.hostname, 253),
      path: logValue(url.pathname, 512),
      hasQuery: url.search.length > 0,
      clientIp: logValue(request.headers.get("CF-Connecting-IP"), 64),
      clientIpv6: logValue(request.headers.get("CF-Connecting-IPv6"), 64),
      rayId: logValue(request.headers.get("CF-Ray"), 128),
      userAgent: logValue(request.headers.get("User-Agent"), 512),
      country: logValue(request.cf?.country, 8),
      asn: request.cf?.asn ?? null,
      colo: logValue(request.cf?.colo, 16),
      status,
    });

    const headers = new Headers({
      "Content-Type": trap === "/.env" && readable
        ? "text/plain; charset=utf-8"
        : "text/html; charset=utf-8",
      "Cache-Control": "no-store",
      "CDN-Cache-Control": "no-store",
      "X-Robots-Tag": "noindex, nofollow, noarchive",
      "X-Content-Type-Options": "nosniff",
      "Content-Security-Policy": "default-src 'none'; base-uri 'none'; form-action 'none'; frame-ancestors 'none'",
      "Referrer-Policy": "no-referrer",
      "X-Request-Id": requestId,
    });
    if (!readable) {
      headers.set("Allow", "GET, HEAD");
      headers.set("Content-Type", "text/plain; charset=utf-8");
    }

    return new Response(
      request.method === "HEAD" ? null : readable ? decoyBody(trap, isStatus) : "Method not allowed\n",
      { status, headers },
    );
  },
};
