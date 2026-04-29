# Native-First Bun Static Site Generator Design

## Goal

Rebuild this portfolio as a fully static, native Web Platform-first site powered by Bun for local tooling only.

The purpose of this work is technical modernization, not content review. Existing profile, work history, certification, achievement, skill, and link content should be migrated as-is unless a mechanical format change is required.

## Non-Goals

- Do not refine resume wording or career content.
- Do not keep or rebuild `/posts`.
- Do not keep existing Markdown posts.
- Do not introduce React, Preact, Fresh, Astro, Next.js, Qwik, or Tailwind.
- Do not require Bun in production.
- Do not add a `tests/` directory.
- Do not add a `client/` or `render/` directory.
- Do not add `theme.ts`; theme behavior should be CSS-first.

## Target Shape

The output must be a portable static site:

```txt
dist/
  index.html
  styles.css
  favicon.svg
  manifest.json
```

The site must run from any ordinary static host, including Cloudflare Pages, GitHub Pages, Netlify, S3-compatible hosting, or a plain static file server. `Bun.serve()` may be used only for local preview.

## Source Layout

Use a small flat source layout:

```txt
src/
  profile.ts
  html.ts
  styles.css
  build.ts
  serve.ts
  html.test.ts
  build.test.ts
```

`src/profile.ts` is the migrated data source from `constants/about.ts`. Its content should remain semantically unchanged.

`src/html.ts` owns HTML generation. It should include the document shell, HTML escaping helpers, and section rendering functions. If it becomes too large during implementation, split only after there is a clear reason.

`src/styles.css` owns all styling with standard CSS.

`src/build.ts` creates `dist/`, writes `index.html`, copies `styles.css`, and copies static assets.

`src/serve.ts` serves `dist/` locally through `Bun.serve()` for manual verification.

Tests must be co-located as `*.test.ts` files under `src/`.

## Deletions

The migration should remove the Fresh application and unused blog surface:

```txt
routes/
islands/
components/
hooks/
utils/markdown.ts
utils/data.ts
data/*.md
data/page_map.json
fresh.gen.ts
dev.ts
main.ts
deno.json
deno.lock
static/tailwind-config.js
static/tailwind-config.css
tests/
```

Keep reusable static assets such as `static/favicon.svg` and `static/manifest.json`.

## Web Platform Direction

Prefer browser standards over framework abstractions.

CSS should use:

- Cascade layers for reset, tokens, base, layout, components, and utilities.
- CSS custom properties for color and spacing tokens.
- `color-scheme` for native light and dark rendering.
- Media queries for `prefers-color-scheme`, `prefers-reduced-motion`, and `prefers-contrast`.
- Container queries where component-level responsiveness is cleaner than viewport breakpoints.
- Modern selectors such as `:where()` and `:has()` when they simplify the stylesheet without hurting readability.

Theme support should be CSS-first. Use `prefers-color-scheme` and `color-scheme`; do not add JavaScript theme persistence in the first implementation.

JavaScript should be avoided unless a concrete browser-native enhancement requires it. The initial implementation should ship no client JavaScript.

## Build And Tooling

Use Bun as the project toolchain:

```txt
bun install
bun run build
bun test
bun run check
bun run serve
```

The project should move from `deno.json` to `package.json` and `bun.lock`.

Suggested scripts:

```json
{
  "scripts": {
    "build": "bun run src/build.ts",
    "check": "bun test && bun run build",
    "serve": "bun run src/serve.ts"
  }
}
```

If formatting or linting is added, prefer tools that do not pull the project back into a framework.

## HTML Requirements

`dist/index.html` should:

- Be valid standalone HTML.
- Include complete metadata for title, description, viewport, author, Open Graph, Twitter card, favicon, and manifest.
- Preserve the current top-level resume sections.
- Preserve accessibility basics such as semantic landmarks, headings, lists, `address`, `time`, and useful link text.
- Reference only local static assets.
- Avoid inline scripts.
- Avoid external CDN dependencies.

Structured data may be added if it can be generated directly from existing profile data without content review.

## Styling Requirements

The visual design should stay close to the current site. This is not a visual redesign.

Preserve:

- Minimal resume-like layout.
- Narrow readable content column.
- Light and dark support.
- Monospace-forward text feel.
- Existing section order.
- Print-friendly output.

Improve mechanically where needed:

- Remove Tailwind CDN.
- Replace utility-heavy styling with maintainable CSS.
- Keep text readable on mobile.
- Keep print styles usable.
- Avoid layout shifts from dynamic controls, since no client theme button will exist initially.

## Runtime And Deployment

Production must not depend on Bun runtime APIs. `Bun.serve()` is only for local preview.

Deployment model:

1. Run `bun run build`.
2. Upload `dist/` to any static host.
3. Serve with normal static file headers.

If a dynamic server is needed later, design it as a separate adapter around static assets rather than a requirement for this site.

## Testing

Use Bun's test runner with co-located tests.

`src/html.test.ts` should verify:

- HTML escaping protects generated text.
- The generated document contains expected landmarks and sections.
- The generated document has no external CDN script/style references.
- The generated document includes local stylesheet and metadata references.

`src/build.test.ts` should verify:

- The build creates `dist/index.html`.
- The build copies required static assets.
- The generated output does not contain Fresh, Preact, Tailwind CDN, or `/posts` links.

The first implementation does not need browser automation. Add Playwright later only if visual or browser API behavior becomes hard to validate with static checks.

## Migration Sequence

1. Add Bun project files and scripts.
2. Create `src/profile.ts` by mechanically migrating current profile data.
3. Create `src/html.ts` and generate the current single-page portfolio as static HTML.
4. Create `src/styles.css` with native CSS matching the current appearance.
5. Create `src/build.ts` and `src/serve.ts`.
6. Add co-located Bun tests.
7. Remove Fresh, Preact, Tailwind CDN, posts, Markdown data, and Deno files.
8. Run `bun run check`.
9. Manually inspect the static site through local preview.

## Acceptance Criteria

- `bun run check` passes.
- `bun run build` produces a complete `dist/`.
- `dist/index.html` works without JavaScript.
- The site has no runtime dependency on Bun.
- The site has no Fresh, Preact, Tailwind, external CDN, blog, or Markdown runtime dependency.
- Existing portfolio content is preserved without editorial review.
- Existing `/posts` content and Markdown files are removed from the active codebase.

