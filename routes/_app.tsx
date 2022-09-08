/** @jsx h */
import { h } from 'preact';
import { tw } from '@twind';
import { Head } from '$fresh/runtime.ts';
import { AppProps } from '$fresh/src/server/types.ts';

export default function App({ Component }: AppProps) {
  return (
    <html data-custom='data'>
      <Head>
        <title>@kazuma0129</title>
      </Head>
      <body
        class={tw`antialiased dark:bg-black dark:text-white font-bold transition-colors duration-700`}
      >
        <Component />
      </body>
    </html>
  );
}
