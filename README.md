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
