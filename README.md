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

After deployment, CI makes a tagged request and verifies a matching live log
with a client IP. Captured log contents and IPs are never printed to Actions logs.
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
are included. GET/HEAD return synthetic, non-cacheable content; other methods
are logged and rejected with 405 without reading the body. HTML decoys link to
`/admin/status` so a follow-up visit can be distinguished from an initial probe.
They have no login form, executable payload, real credentials, or external links.

The portfolio and all other paths retain the Static Assets response, including
the existing behavior of `/robots.txt` and `/sitemap.xml`. Plain `bun run serve`
previews only the static site; use `bun run dev:cloudflare` to test the decoys.

### Viewing captured requests

In Cloudflare, open **Workers & Pages → fresh-portfolio → Observability → Logs**
and filter the structured `event` field to `honeypot.request`. Each record includes
UTC time, request ID, path, trap, entry/followup stage, method, connecting IP,
User-Agent, country, ASN, colo, Ray ID, and response status. The response's
`X-Request-Id` matches the log record for verification. Records are private to the
Cloudflare account; there is no public log endpoint or automatic email delivery.

Sampling is set to 100%. Workers Logs retention currently depends on the account
plan (3 days Free / 7 days Paid), so export needed evidence before it expires.
The account's logging and request limits still apply. Requests blocked by WAF
before reaching the Worker are available in **Security Events**, not these logs.

Client IP is Cloudflare's observed connecting IP, not proof of a person's identity;
it may belong to a proxy/VPN or represent a Worker subrequest. Do not use a single
hit as proof of abuse. Cookies, Authorization, request bodies, and query values
are not read or explicitly logged; automatic invocation logs are disabled to avoid
retaining full URLs. Cloudflare can still attach platform metadata to custom logs.

Synthetic 200 responses are intentional decoys, not evidence that a real PHP,
WordPress, admin, or environment file was exposed. No PHP or WordPress runtime is
installed. Removing `main`, `binding`, `run_worker_first`, and `observability` from
`wrangler.jsonc` restores the previous assets-only deployment.
