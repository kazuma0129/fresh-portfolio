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
        <link rel="stylesheet" href="/gfm.css" />
      </Head>
      <main>
        <h1>{props.data.page.title}</h1>
        <div
          class="markdown-body"
          dangerouslySetInnerHTML={{ __html: props.data.page.html }}
        />
      </main>
    </>
  );
};
