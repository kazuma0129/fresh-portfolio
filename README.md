# portfolio

Static portfolio generated with Bun tooling.

## Usage

Install dependencies:

```sh
bun install
```

Build the static site:

```sh
bun run build
```

Run tests and build:

```sh
bun run check
```

Preview `dist/` locally:

```sh
bun run serve
```

Preview with the Cloudflare Workers runtime:

```sh
bun run dev:cloudflare
```

## Deployment

The production site is deployed to Cloudflare Workers Static Assets. Pushes to
`master` run the test, type-check, and build steps before deploying `dist/`
and the honeypot Worker.

After deployment, CI submits dummy login values and verifies a matching live log
with the submitted fields, referrer, and a client IP. Captured log contents and
IPs are never printed to Actions logs.
These verification requests use a `Portfolio-Honeypot-Verification/` User-Agent.

Add these GitHub Actions repository secrets before the first deployment:

- `CLOUDFLARE_ACCOUNT_ID`: the Cloudflare account ID that owns
  `kazuma0129.work`
- `CLOUDFLARE_API_TOKEN`: an API token created from the **Edit Cloudflare
  Workers** template and scoped to that account and zone

To deploy manually from an authenticated development environment:

```sh
bun run deploy
```

## Honeypot

`src/worker.ts` provides low-interaction decoys for the suspicious paths observed
in traffic analytics: `/wp/`, `/admin`, `/index.php`, `/blog/`, `/1.php`,
`/wp-content/plugins/index.php`, and `/.env`. Trailing slashes and descendants
are included. GET/HEAD return synthetic, non-cacheable content. The `.env` decoy
also advertises `/admin/login`, without containing a working credential.

`/admin`, `/admin/login`, `/wp`, `/wp-admin`, and `/wp-login.php` show a synthetic
administrator login form. Nested `login`, `login.php`, and `wp-login.php` paths
under the trapped prefixes are also accepted, including `/blog/wp-login.php`.
Form submissions always fail with 401. There is no authentication backend,
outbound credential check, executable upload, or actual administration capability.
Other trapped pages link to the login form and `/admin/status`.

Login POSTs accept URL-encoded forms and JSON. Only username aliases (`username`,
`log`, `user`, `email`, `login`, `id`), password aliases (`password`, `pwd`, `pass`),
and the page correlation ID are extracted. Requests are limited to 8 KiB and a
5-second body-read deadline; unsupported bodies return 415, oversized bodies 413,
malformed bodies 400, and timed-out bodies 408. Other methods on non-login decoys
return 405 without parsing the body. Input is never reflected into the response.

The portfolio and all other paths retain the Static Assets response, including
the existing behavior of `/robots.txt` and `/sitemap.xml`. Plain `bun run serve`
previews only the static site; use `bun run dev:cloudflare` to test the decoys.

### Viewing captured requests

In Cloudflare, open **Workers & Pages → fresh-portfolio → Observability → Logs**
and filter the structured `event` field to `honeypot.request` (page requests) or
`honeypot.login` (login attempts). Each record includes UTC time, request ID,
path, trap, stage, method, connecting IP, User-Agent, country, ASN, colo, Ray ID,
referrer, and response status. The response's
`X-Request-Id` matches the log record for verification. Records are private to the
Cloudflare account; there is no public log endpoint or automatic email delivery.

Login records include `submittedUsername` (up to 256 characters) and
`submittedPassword` (up to 512 characters), their original lengths, truncation
flags, parse status, and the always-denied outcome. These fields intentionally
contain attempted credentials in plaintext in the private telemetry pipeline;
do not publish the raw logs. Live output and persisted/API views may redact fields
differently (client IPs were masked in the persisted API response at rollout).
Do not interpret a masked value as the visitor's literal input.

The form's generated `pageId` links a submission to its page-view request ID.
A random `__Host-admin_session` cookie groups visits for 30 minutes, with Secure,
HttpOnly, and SameSite=Strict. This is a correlation hint, not an authenticated
session; clients can discard or forge it. Sort a session's events by timestamp to
inspect attempted combinations and intervals. CI requests use the verification
User-Agent above and should be excluded from incident analysis.

`referer` contains only an HTTP(S) origin and path, up to 1024 characters. URL
credentials, query values, and fragments are discarded. `refererState` distinguishes
present/missing/invalid values, and `refererHasQuery` records whether a query was
removed. The decoys use `Referrer-Policy: same-origin` so browsers can send the
login page's path on a form POST. Missing referrers are normal; header values and
User-Agents can be forged and do not prove a visitor's actual origin.

Sampling is set to 100%. Workers Logs retention currently depends on the account
plan (3 days Free / 7 days Paid), so export needed evidence before it expires.
The account's logging and request limits still apply. Requests blocked by WAF
before reaching the Worker are available in **Security Events**, not these logs.

Client IP is Cloudflare's observed connecting IP, not proof of a person's identity;
it may belong to a proxy/VPN or represent a Worker subrequest. Do not use a single
hit as proof of abuse. Apart from the allowlisted login fields and the dedicated
correlation cookie described above, cookies, Authorization, body fields, and query
values are not logged. Automatic invocation logs are disabled to avoid retaining
full URLs. Cloudflare can still attach platform metadata to custom logs.

Synthetic 200 responses are intentional decoys, not evidence that a real PHP,
WordPress, admin, or environment file was exposed. No PHP or WordPress runtime is
installed. Removing `main`, `binding`, `run_worker_first`, and `observability` from
`wrangler.jsonc` restores the previous assets-only deployment.
