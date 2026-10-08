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

  test("login decoys never reflect query payloads and only submit to this site", async () => {
    const response = await worker.fetch(new Request("https://example.com/admin?q=%3Cscript%3Ealert(1)%3C/script%3E"), { ASSETS: assets });
    const body = await response.text();
    expect(body).not.toContain("<script");
    expect(body).toContain('<form method="post" action="/admin/login"');
    expect(body).toContain('href="/admin/status"');
    expect(response.headers.get("Content-Security-Policy")).toContain("form-action 'self'");
    expect(response.headers.get("Referrer-Policy")).toBe("same-origin");
  });

  test("records a form attempt and correlates it with its page without authenticating", async () => {
    const view = await worker.fetch(new Request("https://example.com/admin/login"), { ASSETS: assets });
    const pageId = view.headers.get("X-Request-Id")!;
    const cookie = view.headers.get("Set-Cookie")!.split(";")[0];
    const pageLog = log.mock.calls[0]?.[0];
    const response = await worker.fetch(new Request("https://example.com/admin/login", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded", "Cookie": cookie, "Referer": "https://example.com/admin/login?secret=hidden" },
      body: new URLSearchParams({ username: "admin", password: "password123", pageId, extra: "do-not-log-this" }),
    }), { ASSETS: assets });
    const entry = log.mock.calls[1]?.[0];
    expect(response.status).toBe(401);
    expect(response.headers.get("Location")).toBeNull();
    expect(entry).toMatchObject({ event: "honeypot.login", submittedUsername: "admin", submittedPassword: "password123", pageId, sessionId: pageLog.sessionId, outcome: "denied", referer: "https://example.com/admin/login", refererHasQuery: true });
    expect(JSON.stringify(entry)).not.toContain("do-not-log-this");
    expect(JSON.stringify(entry)).not.toContain("secret=hidden");
    const html = await response.text();
    expect(html).toContain("Unable to sign in");
    expect(html).not.toContain("password123");
    expect(response.headers.get("Set-Cookie")).toContain("HttpOnly; Secure; SameSite=Strict");
  });

  test("captures common bot field names and JSON while ignoring other properties", async () => {
    for (const [path, body, type] of [
      ["/wp-login.php", "log=root&pwd=toor&redirect_to=https://evil.example", "application/x-www-form-urlencoded"],
      ["/blog/wp-login.php", '{"user":"root","pass":"toor","authorization":"private-secret"}', "application/json"],
    ]) {
      const response = await worker.fetch(new Request(`https://example.com${path}`, { method: "POST", headers: { "Content-Type": type }, body }), { ASSETS: assets });
      expect(response.status).toBe(401);
      expect(log.mock.calls.at(-1)?.[0]).toMatchObject({ submittedUsername: "root", submittedPassword: "toor" });
      expect(JSON.stringify(log.mock.calls.at(-1)?.[0])).not.toContain("evil.example");
      expect(JSON.stringify(log.mock.calls.at(-1)?.[0])).not.toContain("private-secret");
    }
  });

  test("enforces body bounds with and without a declared content length", async () => {
    for (const declared of [false, true]) {
      const headers: Record<string, string> = { "Content-Type": "application/x-www-form-urlencoded" };
      if (declared) headers["Content-Length"] = "9000";
      const response = await worker.fetch(new Request("https://example.com/admin/login", { method: "POST", headers, body: "password=" + "x".repeat(9000) }), { ASSETS: assets });
      expect(response.status).toBe(413);
      expect(log.mock.calls.at(-1)?.[0]).toMatchObject({ event: "honeypot.login", parseStatus: "body_too_large" });
      expect(log.mock.calls.at(-1)?.[0]).not.toHaveProperty("submittedPassword");
    }
  });

  test("handles malformed and unsupported bodies without logging their content", async () => {
    for (const [type, body, status] of [["application/json", "{secret", 400], ["text/plain", "secret", 415]] as const) {
      const response = await worker.fetch(new Request("https://example.com/admin/login", { method: "POST", headers: { "Content-Type": type }, body }), { ASSETS: assets });
      expect(response.status).toBe(status);
      expect(JSON.stringify(log.mock.calls.at(-1)?.[0])).not.toContain("secret");
    }
  });

  test("caps individual credentials and marks truncation", async () => {
    await worker.fetch(new Request("https://example.com/admin/login", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ username: "u".repeat(300), password: "p".repeat(700), pageId: "forged-id" }) }), { ASSETS: assets });
    const entry = log.mock.calls[0]?.[0];
    expect(entry).toMatchObject({ usernameLength: 300, passwordLength: 700, usernameTruncated: true, passwordTruncated: true, pageId: null });
    expect(entry.submittedUsername).toHaveLength(256);
    expect(entry.submittedPassword).toHaveLength(512);
  });

  test("records useful referrers but omits URL credentials, queries, and fragments", async () => {
    for (const [referer, expected, state] of [
      ["https://user:secret@search.example/results?q=private#fragment", "https://search.example/results", "present"],
      ["javascript:alert(1)", null, "invalid"],
      ["", null, "missing"],
    ] as const) {
      await worker.fetch(new Request("https://example.com/.env", { headers: { Referer: referer } }), { ASSETS: assets });
      expect(log.mock.calls.at(-1)?.[0]).toMatchObject({ referer: expected, refererState: state });
      expect(JSON.stringify(log.mock.calls.at(-1)?.[0])).not.toContain("secret");
      expect(JSON.stringify(log.mock.calls.at(-1)?.[0])).not.toContain("private");
    }
  });
});
