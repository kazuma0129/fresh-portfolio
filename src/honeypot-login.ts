export const MAX_LOGIN_BYTES = 8192;
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export function correlationId(value: string | null | undefined): string | null {
  return value && UUID.test(value) ? value : null;
}

export function sessionId(request: Request): string {
  const value = request.headers.get("Cookie")?.match(/(?:^|;\s*)__Host-admin_session=([^;]*)/)?.[1];
  return correlationId(value) ?? crypto.randomUUID();
}

export function refererInfo(value: string | null) {
  if (!value) return { referer: null, refererState: "missing", refererHasQuery: false };
  try {
    const url = new URL(value);
    if (!['http:', 'https:'].includes(url.protocol)) throw new Error("Unsupported protocol");
    return { referer: `${url.origin}${url.pathname}`.slice(0, 1024), refererState: "present", refererHasQuery: Boolean(url.search) };
  } catch {
    return { referer: null, refererState: "invalid", refererHasQuery: false };
  }
}

export function isLoginPath(path: string): boolean {
  return (path === "/admin" || path.startsWith("/admin/") ||
    path === "/wp" || path === "/wp-admin" || path.startsWith("/wp-admin/") ||
    /\/(?:wp-login\.php|login(?:\.php)?)$/.test(path)) && path !== "/admin/status";
}

class BodyError extends Error {
  constructor(readonly status: number, readonly reason: string) { super(reason); }
}

async function boundedBody(request: Request): Promise<string> {
  const length = request.headers.get("Content-Length");
  if (length && Number(length) > MAX_LOGIN_BYTES) throw new BodyError(413, "body_too_large");
  const reader = request.body?.getReader();
  if (!reader) return "";
  const chunks: Uint8Array[] = [];
  let size = 0;
  let timer: ReturnType<typeof setTimeout>;
  const timeout = new Promise<never>((_, reject) => {
    timer = setTimeout(() => reject(new BodyError(408, "body_timeout")), 5000);
  });
  try {
    while (true) {
      const result = await Promise.race([reader.read(), timeout]);
      if (result.done) break;
      size += result.value.byteLength;
      if (size > MAX_LOGIN_BYTES) throw new BodyError(413, "body_too_large");
      chunks.push(result.value);
    }
    const body = new Uint8Array(size);
    let offset = 0;
    for (const chunk of chunks) { body.set(chunk, offset); offset += chunk.byteLength; }
    return new TextDecoder("utf-8", { fatal: true }).decode(body);
  } finally {
    clearTimeout(timer!);
    void reader.cancel().catch(() => {});
    reader.releaseLock();
  }
}

function credential(value: string | null, limit: number) {
  return { value: value?.slice(0, limit) ?? null, length: value?.length ?? 0, truncated: (value?.length ?? 0) > limit };
}

export async function readLoginAttempt(request: Request) {
  const mediaType = request.headers.get("Content-Type")?.split(";", 1)[0].trim().toLowerCase();
  if (!['application/x-www-form-urlencoded', 'application/json'].includes(mediaType ?? "")) {
    return { status: 415, attempt: { parseStatus: "unsupported_media_type" } };
  }
  try {
    const body = await boundedBody(request);
    let get: (key: string) => string | null;
    if (mediaType === "application/json") {
      const parsed: unknown = JSON.parse(body);
      if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) throw new Error("Invalid object");
      const fields = parsed as Record<string, unknown>;
      get = (key) => Object.hasOwn(fields, key) && typeof fields[key] === "string" ? fields[key] as string : null;
    } else {
      const fields = new URLSearchParams(body);
      get = (key) => fields.get(key);
    }
    const user = credential(get("username") ?? get("log") ?? get("user") ?? get("email") ?? get("login") ?? get("id"), 256);
    const pass = credential(get("password") ?? get("pwd") ?? get("pass"), 512);
    return { status: 401, attempt: {
      parseStatus: "parsed",
      submittedUsername: user.value,
      submittedPassword: pass.value,
      usernameLength: user.length,
      passwordLength: pass.length,
      usernameTruncated: user.truncated,
      passwordTruncated: pass.truncated,
      pageId: correlationId(get("pageId")),
      outcome: "denied",
    } };
  } catch (error) {
    return { status: error instanceof BodyError ? error.status : 400,
      attempt: { parseStatus: error instanceof BodyError ? error.reason : "malformed_body" } };
  }
}

export function loginDocument(requestId: string, wordpress: boolean, failed: boolean): string {
  // Only server-generated IDs and fixed strings enter this document. Submitted
  // credentials, redirect targets, and request headers are never reflected.
  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta name="robots" content="noindex, nofollow, noarchive">
  <title>Site Administration — Sign in</title>
  <style nonce="${requestId}">
    *{box-sizing:border-box}body{margin:0;background:#f3f4f6;color:#182230;font:15px/1.5 system-ui,sans-serif;min-height:100vh;display:grid;place-items:center;padding:24px}
    main{width:100%;max-width:390px}.brand{font-size:13px;letter-spacing:.08em;text-transform:uppercase;color:#64748b;margin:0 0 18px;text-align:center}
    .card{background:white;border:1px solid #dce1e7;border-radius:10px;padding:30px;box-shadow:0 6px 24px #18223008}h1{font-size:24px;line-height:1.25;margin:0 0 8px;font-weight:600}
    .intro{color:#64748b;margin:0 0 24px}label{display:block;font-weight:500;margin:18px 0 6px}input{width:100%;padding:11px 12px;border:1px solid #b8c2ce;border-radius:5px;font:inherit}
    input:focus{outline:2px solid #2563eb;outline-offset:2px}button{width:100%;margin-top:24px;padding:12px;border:0;border-radius:5px;background:#1e40af;color:white;font:inherit;font-weight:600;cursor:pointer}
    button:focus-visible{outline:3px solid #60a5fa;outline-offset:3px}.error{padding:10px 12px;background:#fff1f2;color:#9f1239;border:1px solid #fecdd3;border-radius:5px;margin:20px 0}
    footer{text-align:center;color:#64748b;font-size:12px;margin:18px 0}footer a{color:inherit}
  </style>
</head>
<body>
  <main>
    <p class="brand">Site Administration</p>
    <section class="card" aria-labelledby="heading">
      <h1 id="heading">Sign in</h1>
      <p class="intro">Enter your administrator credentials.</p>
      ${failed ? '<p class="error" role="alert">Unable to sign in. Check your credentials and try again.</p>' : ''}
      <form method="post" action="${wordpress ? '/wp-login.php' : '/admin/login'}" autocomplete="off">
        <input type="hidden" name="pageId" value="${requestId}">
        <label for="username">Username</label>
        <input id="username" name="${wordpress ? 'log' : 'username'}" type="text" autocomplete="off" autocapitalize="none" spellcheck="false" maxlength="256" required>
        <label for="password">Password</label>
        <input id="password" name="${wordpress ? 'pwd' : 'password'}" type="password" autocomplete="new-password" maxlength="512" required>
        <button type="submit">Sign in</button>
      </form>
    </section>
    <footer>Authorized personnel only · <a href="/admin/status">Service status</a></footer>
  </main>
</body>
</html>`;
}
