import Nav from './Nav';
import Footer from './Footer';
import RoleOnboarding from './RoleOnboarding';
import CookieConsent from './CookieConsent';

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col bg-luxury-bg text-luxury-surface">
      <Nav />
      <div className="flex-1 w-full mx-auto max-w-[1800px] px-4 md:px-8 py-8">{children}</div>
      <RoleOnboarding />
      <CookieConsent />
      <Footer />
    </div>
  );
}
