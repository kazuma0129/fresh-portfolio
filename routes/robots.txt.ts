import { Handlers } from "$fresh/server.ts";

const SITE_URL = "https://fresh-portfolio.deno.dev";

export const handler: Handlers = {
  GET() {
    const robots = `User-agent: *
Allow: /

Sitemap: ${SITE_URL}/sitemap.xml

# Crawl-delay for respectful crawling
Crawl-delay: 1`;

    return new Response(robots, {
      headers: {
        "Content-Type": "text/plain",
        "Cache-Control": "public, max-age=86400", // 24 hours
      },
    });
  },
};
