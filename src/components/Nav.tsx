import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { FaPalette } from 'react-icons/fa6';
import { useCart } from '../lib/cart';
import { supabase } from '../lib/supabase';
import { useCurrentProfile } from '../lib/useCurrentProfile';
import { useTheme } from './ThemeContext';

const navLinks = [
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
  const themeLabel = theme.charAt(0).toUpperCase() + theme.slice(1);
  const signedIn = Boolean(profile);

  async function handleSignOut() {
    await supabase.auth.signOut();
    setOpen(false);
  }

  return (
    <header className="sticky top-0 z-[100] border-b border-white/10 bg-vaha-ink/90 backdrop-blur-md">
      <nav className="vaha-container flex items-center justify-between py-5" aria-label="Main">
        <Link href="/" className="flex items-center gap-3" aria-label="Savannah Home">
          <Image src="/images/logo.png" alt="" width={40} height={40} className="rounded-full border border-vaha-gold/30" priority />
          <span className="font-serif text-xl tracking-wide text-vaha-cream md:text-2xl">Savannah</span>
        </Link>

        <div className="hidden items-center gap-8 lg:flex">
          {navLinks.map((link) => (
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
          <button
            type="button"
            onClick={cycleTheme}
            className="grid h-8 w-8 place-items-center text-vaha-muted hover:text-vaha-gold"
            aria-label={`Cycle theme. Current: ${themeLabel}`}
          >
            <FaPalette className="text-sm" />
          </button>
          <Link
            href="/book"
            className="border border-vaha-gold bg-vaha-gold px-6 py-2 text-xs font-semibold uppercase tracking-[0.25em] text-vaha-ink transition-colors hover:bg-white hover:border-white"
          >
            Reserve
          </Link>
        </div>

        <button
          type="button"
          className="flex flex-col gap-1.5 p-2 lg:hidden"
          aria-label={open ? 'Close menu' : 'Open menu'}
          aria-expanded={open}
          onClick={() => setOpen((v) => !v)}
        >
          <span className="block h-0.5 w-6 bg-vaha-gold" />
          <span className="block h-0.5 w-6 bg-vaha-gold" />
          <span className="block h-0.5 w-4 bg-vaha-gold" />
        </button>
      </nav>

      {open ? (
        <div className="fixed inset-0 z-[110] bg-vaha-ink/95 lg:hidden" role="dialog" aria-modal="true" aria-label="Mobile navigation">
          <div className="vaha-container flex h-full flex-col py-8">
            <button type="button" className="self-end text-3xl text-vaha-muted" onClick={() => setOpen(false)} aria-label="Close">
              ×
            </button>
            <div className="mt-8 flex flex-1 flex-col gap-6">
              {[...navLinks, { href: '/cart', label: `Cart${count > 0 ? ` (${count})` : ''}` }, { href: '/book', label: 'Reserve' }].map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="font-serif text-3xl text-vaha-cream hover:text-vaha-gold"
                  onClick={() => setOpen(false)}
                >
                  {link.label}
                </Link>
              ))}
            </div>
            <div className="border-t border-white/10 pt-6 text-sm text-vaha-muted">
              {accountLoading ? 'Checking account…' : signedIn ? profile?.email : 'Guest'}
              {signedIn ? (
                <button type="button" onClick={handleSignOut} className="mt-4 block text-vaha-gold uppercase tracking-widest text-xs">
                  Sign out
                </button>
              ) : (
                <Link href="/login" className="mt-4 block text-vaha-gold uppercase tracking-widest text-xs" onClick={() => setOpen(false)}>
                  Sign in
                </Link>
              )}
            </div>
          </div>
        </div>
      ) : null}
    </header>
  );
}
