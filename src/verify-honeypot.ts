/** Post-deployment check. Never print captured logs or client IPs to CI output. */
import { isIP } from "node:net";

const marker = `Portfolio-Honeypot-Verification/${crypto.randomUUID()}`;
const requestIds = new Set<string>();
const loggedIds = new Set<string>();
let verified = false;
let pending = "";

function inspect(value: unknown): void {
  if (typeof value === "string") {
    try { inspect(JSON.parse(value)); } catch { /* Non-JSON log message. */ }
  } else if (Array.isArray(value)) {
    value.forEach(inspect);
  } else if (value && typeof value === "object") {
    const entry = value as Record<string, unknown>;
    if (entry.event === "honeypot.login" && entry.userAgent === marker &&
        entry.submittedUsername === "honeypot-ci" && entry.submittedPassword === "decoy-test-only" &&
        entry.referer === "https://kazuma0129.work/admin/login" && entry.outcome === "denied" &&
        typeof entry.requestId === "string" &&
        typeof entry.clientIp === "string" && isIP(entry.clientIp) !== 0) {
      loggedIds.add(entry.requestId);
      if (requestIds.has(entry.requestId)) verified = true;
    }
    Object.values(entry).forEach(inspect);
  }
}

// Wrangler emits consecutive JSON objects. Decode complete objects without
// forwarding their content to the public Actions log.
function consume(chunk: string): void {
  pending += chunk;
  let start = -1, depth = 0, quoted = false, escaped = false;
  for (let i = 0; i < pending.length; i++) {
    const char = pending[i];
    if (start < 0) {
      if (char === "{") { start = i; depth = 1; }
      continue;
    }
    if (quoted) {
      if (escaped) escaped = false;
      else if (char === "\\") escaped = true;
      else if (char === '"') quoted = false;
    } else if (char === '"') quoted = true;
    else if (char === "{") depth++;
    else if (char === "}" && --depth === 0) {
      try { inspect(JSON.parse(pending.slice(start, i + 1))); } catch { /* CLI text. */ }
      pending = pending.slice(i + 1);
      i = -1;
      start = -1;
    }
  }
  if (pending.length > 1_000_000) throw new Error("Tail output exceeded verification limit");
}

const tail = Bun.spawn([
  "node", "node_modules/wrangler/bin/wrangler.js", "tail", "fresh-portfolio",
  "--format", "json", "--header", `User-Agent:${marker}`,
], { stdout: "pipe", stderr: "ignore", env: { ...process.env, CLOUDFLARE_SEND_METRICS: "false" } });

const reading = (async () => {
  for await (const chunk of tail.stdout) consume(new TextDecoder().decode(chunk));
})();

try {
  for (let attempt = 0; attempt < 12 && !verified; attempt++) {
    await Bun.sleep(3000);
    if (tail.exitCode !== null) throw new Error("Cloudflare log tail exited before verification");
    const response = await fetch("https://kazuma0129.work/admin/login", {
      method: "POST",
      headers: { "User-Agent": marker, "Content-Type": "application/x-www-form-urlencoded", "Referer": "https://kazuma0129.work/admin/login" },
      body: new URLSearchParams({ username: "honeypot-ci", password: "decoy-test-only" }),
      signal: AbortSignal.timeout(10_000),
    });
    const id = response.headers.get("X-Request-Id");
    if (response.status === 401 && response.headers.get("Cache-Control") === "no-store" && id) {
      requestIds.add(id);
      if (loggedIds.has(id)) verified = true;
    }
    await response.arrayBuffer();
    await Bun.sleep(2000);
  }
  if (!verified) throw new Error("No correlated login log with submitted fields, referrer, and a client IP was received");
  console.log("Verified production login denial and matching log with dummy credentials, referrer, and client IP. Raw logs remain private.");
} finally {
  tail.kill("SIGINT");
  await Promise.race([tail.exited, Bun.sleep(3000)]);
  if (tail.exitCode === null) tail.kill("SIGKILL");
  await reading;
}
