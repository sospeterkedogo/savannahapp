import Document, {
  Html,
  Head,
  Main,
  NextScript,
  type DocumentContext,
  type DocumentInitialProps,
} from 'next/document';

type SavDocumentProps = DocumentInitialProps & {
  publicEnvScript: string;
};

function buildPublicEnvScript() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL || '';
  const supabaseAnonKey =
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY || '';

  const payload = JSON.stringify({
    NEXT_PUBLIC_SUPABASE_URL: supabaseUrl,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: supabaseAnonKey,
    SUPABASE_URL: supabaseUrl,
    SUPABASE_ANON_KEY: supabaseAnonKey,
  });

  return `window.__SAVANNAH_PUBLIC_ENV__=${payload};`;
}

export default function SavDocument({ publicEnvScript }: SavDocumentProps) {
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
        <link rel="icon" href="/images/favicon.png" type="image/png" sizes="32x32" />
        <link rel="apple-touch-icon" href="/images/apple-icon.png" sizes="180x180" />
        <meta property="og:image" content="/images/logo.png" />
      </Head>
      <body>
        <script dangerouslySetInnerHTML={{ __html: publicEnvScript }} />
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}

SavDocument.getInitialProps = async (ctx: DocumentContext) => {
  const initialProps = await Document.getInitialProps(ctx);
  return {
    ...initialProps,
    publicEnvScript: buildPublicEnvScript(),
  };
};
