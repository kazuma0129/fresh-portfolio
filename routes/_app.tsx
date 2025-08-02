import { Head } from "$fresh/runtime.ts";
import { type PageProps } from "$fresh/server.ts";

export default function App({ Component }: PageProps) {
  return (
    <html lang="en" data-custom="data" className="h-full">
      <Head>
        <title>Kazuma Ohashi - Software Engineer | CV</title>
        <meta charSet="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <meta name="description" content="Kazuma Ohashi - Software Engineer with 4+ years of experience in frontend and backend development, specializing in JavaScript, TypeScript, and Node.js. Currently at LINE Corporation, Tokyo, Japan." />
        <meta name="keywords" content="Software Engineer, Frontend Developer, Backend Developer, JavaScript, TypeScript, Node.js, React, Vue.js, Tokyo, Japan, LINE Corporation" />
        <meta name="author" content="Kazuma Ohashi" />
        
        {/* Open Graph / Facebook */}
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://kazuma0129.work/" />
        <meta property="og:title" content="Kazuma Ohashi - Software Engineer | CV" />
        <meta property="og:description" content="Software Engineer with 4+ years of experience in frontend and backend development, specializing in JavaScript, TypeScript, and Node.js." />
        <meta property="og:image" content="/icon.png" />
        
        {/* Twitter */}
        <meta property="twitter:card" content="summary_large_image" />
        <meta property="twitter:url" content="https://kazuma0129.work/" />
        <meta property="twitter:title" content="Kazuma Ohashi - Software Engineer | CV" />
        <meta property="twitter:description" content="Software Engineer with 4+ years of experience in frontend and backend development, specializing in JavaScript, TypeScript, and Node.js." />
        <meta property="twitter:image" content="/icon.png" />
        
        <link rel="icon" type="image/x-icon" href="/favicon.svg" />
        <link rel="apple-touch-icon" sizes="180x180" href="/icon.png" />
        <link rel="manifest" href="/manifest.json" />
        <link rel="preconnect" href="https://cdn.tailwindcss.com" />
        <link rel="dns-prefetch" href="https://api.github.com" />

        <script src="https://cdn.tailwindcss.com"></script>
        <script src="/tailwind-config.js"></script>
        <link rel="stylesheet" href="/global.css" />
      </Head>
      <body className="min-h-screen bg-background font-sans antialiased">
        <Component />
      </body>
    </html>
  );
}
