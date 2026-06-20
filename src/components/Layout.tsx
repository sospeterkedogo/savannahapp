import Nav from './Nav';
import Footer from './Footer';
import RoleOnboarding from './RoleOnboarding';
import CookieConsent from './CookieConsent';

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col bg-luxury-bg text-luxury-surface">
      <Nav />
      <main className="flex-1 w-full mx-auto max-w-[1800px] px-8 md:px-16 py-10">{children}</main>
      <RoleOnboarding />
      <CookieConsent />
      <Footer />
    </div>
  );
}
