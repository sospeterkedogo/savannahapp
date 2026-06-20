import '../styles/globals.css';
import type { AppProps } from 'next/app';
import { Inter, Source_Serif_4 } from 'next/font/google';
import { useEffect } from 'react';
import { useRouter } from 'next/router';
import Layout from '../components/Layout';
import { CartProvider } from '../lib/cart';
import { ThemeProvider } from '../components/ThemeContext';

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-sans',
});

const sourceSerif = Source_Serif_4({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-display',
});

export default function App({ Component, pageProps }: AppProps) {
  const router = useRouter();

  useEffect(() => {
    const handleRouteChange = () => {
      if (typeof document !== 'undefined' && 'startViewTransition' in document) {
        // @ts-ignore - document.startViewTransition is a relatively new API
        document.startViewTransition(() => {});
      }
    };

    router.events.on('routeChangeStart', handleRouteChange);
    return () => {
      router.events.off('routeChangeStart', handleRouteChange);
    };
  }, [router]);

  return (
    <ThemeProvider>
      <CartProvider>
        <div className={`${inter.variable} ${sourceSerif.variable} font-sans`}>
          <Layout>
            <Component {...pageProps} />
          </Layout>
        </div>
      </CartProvider>
    </ThemeProvider>
  );
}
