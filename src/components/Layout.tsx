import Nav from './Nav';
import Footer from './Footer';
import CookieConsent from './CookieConsent';

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col bg-vaha-ink text-vaha-cream">
      <Nav />
      <div className="flex-1 w-full">{children}</div>
      <CookieConsent />
      <Footer />
    </div>
  );
}
