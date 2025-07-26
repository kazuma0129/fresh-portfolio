import { Head } from "$fresh/runtime.ts";
import { type PageProps } from "$fresh/server.ts";

export default function App({ Component }: PageProps) {
  return (
    <html data-custom="data">
      <Head>
        <title>@kazuma0129</title>
      </Head>
      <body>
        <Component />
      </body>
    </html>
  );
}
