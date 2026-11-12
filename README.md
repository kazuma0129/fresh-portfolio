# portfolio

Public CV generated with Bun and served by Cloudflare Workers Static Assets.

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

Preview the production Worker and generated assets on localhost:3000:

```sh
bun run serve
```

Preview with the Cloudflare Workers runtime:

```sh
bun run dev:cloudflare
```

## Agent discovery

The build regenerates the sitemap from the HTML page list and converts the
published CV into Markdown. Request the homepage with `Accept: text/markdown`
for Markdown or use a browser for HTML. Both responses carry discovery links
and vary by `Accept`. The public CV permits search, AI input and training.

The public API at `/api/portfolio.json` lists links to actual headings in the
published CV. Its API catalog, OpenAPI specification, documentation and status
document are generated alongside the site. The stateless MCP endpoint at
`/mcp` exposes one read-only tool, `list_portfolio_sections`, backed by the same
index. No API keys, user accounts, OAuth issuer or agent registration are used.

The ARD catalog links to the current
[MCP server card](https://github.com/modelcontextprotocol/experimental-ext-server-card)
at `/mcp/server-card`; the diagnostic's earlier card format is also available
at `/.well-known/mcp/server-card.json`. The skills index hashes the exact
published Markdown bytes on each build.

Run the HTTP checks against your local preview, or omit the origin to check production:

```sh
node scripts/verify-discovery.mjs http://localhost:3000
node scripts/verify-ora.mjs http://localhost:3000
```

The versioned REST directory is at `/api/v1`. The original JSON URLs are
supported. `/docs` describes the public contract and `/developers` provides
a read-only sandbox. A SQLite-backed Cloudflare Durable Object atomically
counts requests per client for each minute, with separate budgets for the
public API (120) and sandbox (5). The Ora verification exhausts only the
sandbox allowance to check a real 429. The homepage retains its intentional
blank screen presentation. New reference pages use a separate stylesheet.

## DNS-AID

The manually dispatched **Publish portfolio DNS-AID index** workflow creates
only the SVCB record in [dns/index.svcb.json](dns/index.svcb.json). It verifies
that the production catalog is live and the zone already validates with DNSSEC,
and stops rather than replacing a different record. For a separate DNS token,
set the repository secret `CLOUDFLARE_DNS_API_TOKEN` (Zone Read and DNS Edit for
this zone only). Otherwise it uses the site's existing Cloudflare token if that
token already has the required access. The same script can be run locally:

```sh
node scripts/publish-dns.mjs
dig +dnssec _index._agents.kazuma0129.work SVCB @1.1.1.1
```

The returned answer must contain the record **and** the authenticated-data
(`ad`) flag. The target is the catalog host; experimental key65409 carries
the filename below `/.well-known/`.

## Deployment

The production site is deployed to Cloudflare Workers Static Assets. Pushes to
`master` run the test, type-check, and build steps before deploying `dist/`.

Add these GitHub Actions repository secrets before the first deployment:

- `CLOUDFLARE_ACCOUNT_ID`: the Cloudflare account ID that owns
  `kazuma0129.work`
- `CLOUDFLARE_API_TOKEN`: an API token created from the **Edit Cloudflare
  Workers** template and scoped to that account and zone

To deploy manually from an authenticated development environment:

```sh
bun run deploy
```
