import { afterAll, afterEach, describe, expect, spyOn, test } from "bun:test";
import worker, { honeypotPaths, matchHoneypot } from "./worker.ts";

const assets = { fetch: async () => new Response("original asset", { status: 404 }) };

describe("honeypot", () => {
  const log = spyOn(console, "log").mockImplementation(() => {});
  afterEach(() => log.mockClear());
  afterAll(() => log.mockRestore());

  test("serves every observed trap and trailing-slash variants without caching", async () => {
    for (const path of honeypotPaths) {
      for (const suffix of ["", "/"]) {
        const response = await worker.fetch(new Request(`https://example.com${path}${suffix}`), { ASSETS: assets });
        expect(response.status).toBe(200);
        expect(response.headers.get("Cache-Control")).toBe("no-store");
        expect(response.headers.get("X-Robots-Tag")).toContain("noindex");
        expect(response.headers.get("X-Request-Id")).toBeTruthy();
        expect(await response.text()).not.toBe("original asset");
      }
    }
  });

  test("does not capture portfolio, crawler paths, or prefix lookalikes", async () => {
    for (const path of ["/", "/index.html", "/styles.css", "/robots.txt", "/sitemap.xml", "/administrator", "/blogger", "/wp-other", "/index.php.txt", "/.environment", "/%zz"]) {
      expect(matchHoneypot(path)).toBeUndefined();
      const response = await worker.fetch(new Request(`https://example.com${path}`), { ASSETS: assets });
      expect(response.status).toBe(404);
      expect(await response.text()).toBe("original asset");
    }
    expect(log).not.toHaveBeenCalled();
  });

  test("captures encoded paths, subpaths, and status followups", async () => {
    expect(matchHoneypot("/%2eenv")).toBe("/.env");
    expect(matchHoneypot("/WP//login")).toBe("/wp");
    const response = await worker.fetch(new Request("https://example.com/admin/status"), { ASSETS: assets });
    expect(log.mock.calls[0]?.[0]).toMatchObject({ trap: "/admin", stage: "followup" });
    expect(await response.text()).toContain("Service status");
  });

  test("records bounded request metadata but never payloads or query values", async () => {
    const request = new Request("https://example.com/.env?token=private-query", {
      method: "POST",
      headers: {
        "CF-Connecting-IP": "192.0.2.1",
        "CF-Ray": "test-ray",
        "User-Agent": "a".repeat(1000),
        "Cookie": "session=private-cookie",
        "Authorization": "Bearer private-auth",
        "X-Forwarded-For": "198.51.100.100",
      },
      body: "password=private-body",
    });
    const response = await worker.fetch(request, { ASSETS: assets });
    expect(response.status).toBe(405);
    expect(response.headers.get("Allow")).toBe("GET, HEAD");
    expect(request.bodyUsed).toBe(false);
    const entry = log.mock.calls[0]?.[0];
    expect(entry).toMatchObject({ event: "honeypot.request", clientIp: "192.0.2.1", rayId: "test-ray", path: "/.env", hasQuery: true, status: 405 });
    expect(entry.userAgent.length).toBe(512);
    expect(entry.requestId).toBe(response.headers.get("X-Request-Id"));
    expect(JSON.stringify(entry)).not.toContain("private-");
    expect(JSON.stringify(entry)).not.toContain("198.51.100.100");
  });

  test("HEAD logs access and returns no response body", async () => {
    const response = await worker.fetch(new Request("https://example.com/admin", { method: "HEAD" }), { ASSETS: assets });
    expect(response.status).toBe(200);
    expect(await response.text()).toBe("");
    expect(log).toHaveBeenCalledTimes(1);
  });

  test("decoys never reflect query payloads or accept forms", async () => {
    const response = await worker.fetch(new Request("https://example.com/admin?q=%3Cscript%3Ealert(1)%3C/script%3E"), { ASSETS: assets });
    const body = await response.text();
    expect(body).not.toContain("<script");
    expect(body).not.toContain("<form");
    expect(body).toContain('href="/admin/status"');
    expect(response.headers.get("Content-Security-Policy")).toContain("form-action 'none'");
  });
});
