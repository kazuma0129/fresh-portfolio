/** @jsx h */
/** @jsxFrag Fragment */
import { Fragment, h } from 'preact';
import { Head } from '$fresh/runtime.ts';
import { tw } from '@twind';
import { Handlers, PageProps } from '$fresh/server.ts';
import { frontMatter, gfm } from '../../utils/markdown.ts';
import { POST_DATA, POST_MAP } from '../../utils/data.ts';

interface PageData {
  page: Page;
}

type Page = {
  html: string;
} & POST_DATA;

export const handler: Handlers<PageData> = {
  async GET(req, ctx) {
    const title = await ctx.params.title;

    if (title === '') {
      return new Response('', {
        status: 307,
        headers: { location: '/posts' },
      });
    }

    const postData = POST_MAP.get(title);
    if (!postData) {
      return new Response('', {
        status: 404,
        headers: { location: '/posts' },
      });
    }

    const url = new URL(`../../${postData.path}`, import.meta.url);
    const fileContent = await Deno.readTextFile(url);
    const { content } = frontMatter(fileContent);
    return ctx.render({
      page: {
        ...postData,
        html: gfm.render(content),
      },
    });
  },
};

export default (props: PageProps<PageData>) => {
  const main = tw`py-16 xl:px-32 lg:px-32 md:px-32 sm:px-16 xs:px-16 px-8`;
  const title = tw`text(4xl gray-900) tracking-tight font-extrabold mt-6`;
  const article = tw`my-6`;
  return (
    <>
      <Head>
        <title>{props.data.page?.title ?? 'Not Found'} | @kazuma0129</title>
        <link rel='stylesheet' href={`/gfm.css?build=${__FRSH_BUILD_ID}`} />
      </Head>
      <main class={main}>
        <h1 class={title}>{props.data.page.title}</h1>
        <div
          class={`${article} markdown-body`}
          dangerouslySetInnerHTML={{ __html: props.data.page.html }}
        />
      </main>
    </>
  );
};
