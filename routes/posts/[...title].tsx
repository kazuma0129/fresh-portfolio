import { Head } from "$fresh/runtime.ts";
import { Handlers, PageProps } from "$fresh/server.ts";
import { frontMatter, gfm } from "../../utils/markdown.ts";
import { POST_DATA, POST_MAP } from "../../utils/data.ts";

interface PageData {
  page: Page;
}

type Page = {
  html: string;
} & POST_DATA;

export const handler: Handlers<PageData> = {
  async GET(_req, ctx) {
    const title = await ctx.params.title;

    if (title === "") {
      return new Response("", {
        status: 307,
        headers: { location: "/posts" },
      });
    }

    const postData = POST_MAP.get(title);
    if (!postData) {
      return new Response("", {
        status: 404,
        headers: { location: "/posts" },
      });
    }

    const url = new URL(`../../${postData.path}`, import.meta.url);
    const response = await fetch(url);
    const fileContent = await response.text();
    const { body: content } = frontMatter.extractYaml(fileContent);
    return ctx.render({
      page: {
        ...postData,
        html: gfm.render(content),
      },
    });
  },
};

export default (props: PageProps<PageData>) => {
  return (
    <>
      <Head>
        <title>{props.data.page?.title ?? "Not Found"} | @kazuma0129</title>
        <meta name="description" content={`Blog post: ${props.data.page?.title ?? "Not Found"}`} />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <link rel="stylesheet" href="/gfm.css" />
      </Head>
      <div className="min-h-screen bg-background">
        <div className="container mx-auto max-w-4xl px-4 py-4">
          <nav aria-label="Breadcrumb" className="mb-4">
            <ol className="flex items-center space-x-2 text-sm text-muted-foreground">
              <li>
                <a 
                  href="/" 
                  className="hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                >
                  Home
                </a>
              </li>
              <li>/</li>
              <li>
                <a 
                  href="/posts" 
                  className="hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                >
                  Posts
                </a>
              </li>
              <li>/</li>
              <li aria-current="page" className="text-foreground">
                {props.data.page?.title}
              </li>
            </ol>
          </nav>
          
          <main role="main">
            <article>
              <header className="mb-6">
                <h1 className="text-3xl font-bold tracking-tight text-foreground mb-2">
                  {props.data.page.title}
                </h1>
              </header>
              
              <div
                className="markdown-body prose prose-slate dark:prose-invert max-w-none"
                dangerouslySetInnerHTML={{ __html: props.data.page.html }}
              />
            </article>
          </main>
        </div>
      </div>
    </>
  );
};
