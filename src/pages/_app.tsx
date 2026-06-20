import '../styles/globals.css';
import type { AppProps } from 'next/app';
import { useEffect } from 'react';
import { useRouter } from 'next/router';
import Layout from '../components/Layout';
import { CartProvider } from '../lib/cart';
import { ThemeProvider } from '../components/ThemeContext';

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
        <Layout>
          <Component {...pageProps} />
        </Layout>
      </CartProvider>
    </ThemeProvider>
  );
}
