import { Html, Head, Main, NextScript } from 'next/document';

export default function Document() {
  return (
    <Html lang="en" data-theme="dark">
      <Head>
        <meta name="color-scheme" content="dark" />
        <script
          dangerouslySetInnerHTML={{
            __html: `
try {
  var theme = localStorage.getItem('savannah-theme');
  if (theme) {
    var normalized = theme === 'light' || theme === 'solar' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', normalized);
    document.documentElement.style.colorScheme = normalized;
    var meta = document.querySelector('meta[name="color-scheme"]');
    if (meta) meta.setAttribute('content', normalized);
  }
} catch (error) {}
`,
          }}
        />
        {/* Favicon */}
        <link rel="icon" href="/images/favicon.png" type="image/png" sizes="32x32" />
        {/* Apple Touch Icon */}
        <link rel="apple-touch-icon" href="/images/apple-icon.png" sizes="180x180" />
        {/* Logo for SEO/social */}
        <meta property="og:image" content="/images/logo.png" />
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
