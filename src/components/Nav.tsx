import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { FaPalette, FaXmark } from 'react-icons/fa6';
import { useCart } from '../lib/cart';
import { supabase } from '../lib/supabase';
import { useCurrentProfile } from '../lib/useCurrentProfile';
import { useTheme } from './ThemeContext';
import { VahaCta } from './vaha/VahaUI';

const navLinks = [
  { href: '/', label: 'Home' },
  { href: '/menu', label: 'Menu' },
  { href: '/info', label: 'About' },
  { href: '/events', label: 'Events' },
  { href: '/hours', label: 'Hours' },
  { href: '/contact', label: 'Contact' },
];

export default function Nav() {
  const [open, setOpen] = useState(false);
  const { count } = useCart();
  const { theme, cycleTheme } = useTheme();
  const { loading: accountLoading, profile } = useCurrentProfile();
  const themeLabel = theme === 'light' ? 'Light' : 'Dark';
  const signedIn = Boolean(profile);

  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [open]);

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') setOpen(false);
    }
    if (open) window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [open]);

  async function handleSignOut() {
    await supabase.auth.signOut();
    setOpen(false);
  }

  function closeMenu() {
    setOpen(false);
  }

  return (
    <header className="sticky top-0 z-[100] border-b border-white/10 bg-vaha-ink/90 backdrop-blur-md">
      <nav className="vaha-container flex items-center justify-between py-3" aria-label="Main">
        <Link href="/" className="flex items-center gap-3" aria-label="Savannah Home">
          <Image src="/images/logo.png" alt="" width={40} height={40} className="rounded-full border border-vaha-gold/30" priority />
          <span className="font-serif text-xl tracking-wide text-vaha-cream md:text-2xl">Savannah</span>
        </Link>

        <div className="hidden items-center gap-8 lg:flex">
          {navLinks.slice(1).map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-xs font-semibold uppercase tracking-[0.2em] text-vaha-muted transition-colors hover:text-vaha-gold"
            >
              {link.label}
            </Link>
          ))}
          <Link href="/cart" className="text-xs font-semibold uppercase tracking-[0.2em] text-vaha-muted hover:text-vaha-gold">
            Cart{count > 0 ? ` (${count})` : ''}
          </Link>
          {signedIn ? (
            <Link href="/profile" className="text-xs font-semibold uppercase tracking-[0.2em] text-vaha-muted hover:text-vaha-gold">
              My Account
            </Link>
          ) : (
            <Link href="/login" className="text-xs font-semibold uppercase tracking-[0.2em] text-vaha-muted hover:text-vaha-gold">
              Sign In
            </Link>
          )}
          <button
            type="button"
            onClick={cycleTheme}
            className="grid h-8 w-8 place-items-center text-vaha-muted hover:text-vaha-gold"
            aria-label={`Change colour theme. Current: ${themeLabel}`}
          >
            <FaPalette className="text-sm" />
          </button>
          <Link
            href="/book"
            className="border border-vaha-gold bg-vaha-gold px-6 py-2 text-xs font-semibold uppercase tracking-[0.25em] text-vaha-ink transition-colors hover:border-white hover:bg-white"
          >
            Book a Table
          </Link>
        </div>

        <button
          type="button"
          className="relative z-[120] flex flex-col items-center justify-center gap-1.5 p-2 lg:hidden"
          aria-label={open ? 'Close menu' : 'Open menu'}
          aria-expanded={open}
          aria-controls="mobile-nav-drawer"
          onClick={() => setOpen((v) => !v)}
        >
          <span className={`block h-0.5 w-6 bg-vaha-gold transition-all duration-300 ${open ? 'translate-y-2 rotate-45' : ''}`} />
          <span className={`block h-0.5 w-6 bg-vaha-gold transition-all duration-300 ${open ? 'scale-x-0 opacity-0' : ''}`} />
          <span className={`block h-0.5 bg-vaha-gold transition-all duration-300 ${open ? 'w-6 -translate-y-2 -rotate-45' : 'w-4'}`} />
        </button>
      </nav>

      <div
        id="mobile-nav-drawer"
        className={`fixed inset-0 z-[110] bg-vaha-ink/98 transition-opacity duration-300 lg:hidden ${open ? 'pointer-events-auto opacity-100' : 'pointer-events-none opacity-0'}`}
        role="dialog"
        aria-modal="true"
        aria-hidden={!open}
        aria-label="Site menu"
        onClick={closeMenu}
      >
        <div className="vaha-container flex h-full flex-col pt-20 pb-8" onClick={(e) => e.stopPropagation()}>
          <div className="mb-4 flex items-center justify-between">
            <p className="vaha-eyebrow">Site menu</p>
            <button
              type="button"
              onClick={closeMenu}
              className="flex h-11 w-11 items-center justify-center border border-white/15 text-vaha-cream hover:border-vaha-gold hover:text-vaha-gold"
              aria-label="Close menu"
            >
              <FaXmark className="text-xl" />
            </button>
          </div>

          <div className="flex flex-1 flex-col gap-1 overflow-y-auto">
            {[...navLinks, { href: '/cart', label: `Cart${count > 0 ? ` (${count})` : ''}` }].map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="vaha-footer-link border-b border-white/5 py-3"
                onClick={closeMenu}
              >
                {link.label}
              </Link>
            ))}
            <Link href="/book" className="vaha-footer-link py-3 text-vaha-gold" onClick={closeMenu}>
              Book a Table
            </Link>
            {signedIn ? (
              <Link href="/profile" className="vaha-footer-link py-3" onClick={closeMenu}>
                My Account
              </Link>
            ) : (
              <Link href="/login" className="vaha-footer-link py-3" onClick={closeMenu}>
                Sign In
              </Link>
            )}
          </div>

          <div className="mt-6 flex items-center justify-between border-t border-white/10 pt-6">
            <div className="text-xs text-vaha-muted">
              {accountLoading ? 'Loading…' : signedIn ? profile?.email : 'Guest'}
              {signedIn ? (
                <button type="button" onClick={handleSignOut} className="mt-2 block text-vaha-gold uppercase tracking-widest">
                  Sign out
                </button>
              ) : null}
            </div>
            <button
              type="button"
              onClick={cycleTheme}
              className="flex items-center gap-2 text-xs uppercase tracking-widest text-vaha-muted hover:text-vaha-gold"
              aria-label={`Change colour theme. Current: ${themeLabel}`}
            >
              <FaPalette /> {themeLabel}
            </button>
          </div>

          <div className="mt-6" onClick={closeMenu}>
            <VahaCta href="/book" variant="solid">
              Book Now
            </VahaCta>
          </div>
        </div>
      </div>
    </header>
  );
}
