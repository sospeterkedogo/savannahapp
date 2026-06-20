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
  { href: '/cart', label: 'Cart' },
  { href: '/profile', label: 'Profile' },
  { href: '/book', label: 'Book' },
  { href: '/contact', label: 'Contact' },
  { href: '/hours', label: 'Hours' },
  { href: '/info', label: 'Info' },
  { href: '/events', label: 'Events & Updates' },
  { href: '/legal', label: 'Legal' },
];

export default function Nav() {
  const [open, setOpen] = useState(false);
  const { count } = useCart();
  const { theme, cycleTheme } = useTheme();
  const { loading: accountLoading, profile } = useCurrentProfile();
  const themeLabel = theme.charAt(0).toUpperCase() + theme.slice(1);
  const signedIn = Boolean(profile);
  const accountLabel = accountLoading ? 'Checking account' : signedIn ? 'Signed in' : 'Guest';
  const accountDetail = profile ? `${profile.email} (${profile.role})` : 'Not signed in';

  async function handleSignOut() {
    await supabase.auth.signOut();
    setOpen(false);
  }

  return (
    <nav className="sticky top-0 z-[100] bg-black/40 backdrop-blur-xl flex items-center justify-between px-12 py-6 border-b border-white/10 shadow-[0_4px_30px_rgba(0,0,0,0.5)]">
      <div className="flex items-center gap-4">
        <Link href="/" aria-label="Savannah Home" className="transition-transform hover:scale-110">
          <Image src="/images/logo.png" alt="Savannah Logo" width={44} height={44} className="rounded-full border border-luxury-accent/30" priority />
        </Link>
        <div className="flex flex-col -gap-1">
          <span className="font-serif text-2xl text-luxury-accent font-bold tracking-[0.2em] uppercase leading-none">Savannah</span>
          <span className="text-[10px] text-white/40 tracking-[0.4em] uppercase font-semibold">Fine Dining</span>
        </div>
      </div>

      <div className="hidden xl:flex gap-8 items-center">
        {navLinks.slice(0, 5).map(link => (
          <Link key={link.href} href={link.href} className="text-sm font-medium uppercase tracking-[0.15em] text-white/80 hover:text-luxury-accent transition-all duration-300">
            {link.label}{link.href === '/cart' && count > 0 ? ` [${count}]` : ''}
          </Link>
        ))}
        
        <div className="h-4 w-px bg-white/10 mx-2" />

        <button
          type="button"
          onClick={cycleTheme}
          className="group relative grid h-9 w-9 place-items-center rounded-full border border-white/10 text-white/60 hover:border-luxury-accent hover:text-luxury-accent transition-all"
          aria-label={`Cycle theme. Current theme: ${themeLabel}`}
        >
          <FaPalette className="text-sm" />
          <span className="pointer-events-none absolute -bottom-10 left-1/2 -translate-x-1/2 whitespace-nowrap rounded bg-black/90 px-2 py-1 text-[10px] font-semibold text-white opacity-0 shadow-xl transition-opacity group-hover:opacity-100">
            {themeLabel}
          </span>
        </button>

        <div className="flex flex-col items-end leading-none mr-2">
          <span className="text-[9px] font-bold uppercase tracking-[0.2em] text-luxury-accent/70 mb-1">{accountLabel}</span>
          <span className="max-w-[120px] truncate text-[11px] text-white/50" title={accountDetail}>{profile?.email || 'GUEST'}</span>
        </div>

        <Link href="/book" className="px-8 py-2.5 bg-luxury-accent text-black rounded-full font-bold text-xs uppercase tracking-widest hover:bg-white transition-all duration-300 shadow-[0_0_15px_rgba(197,160,89,0.2)]">
          Reserve
        </Link>
      </div>
      {/* Hamburger Button - visible until the full nav has room */}
      <button
        className={`xl:hidden flex flex-col gap-1.5 p-2 focus:outline-none focus:ring-2 focus:ring-luxury-accent transition-transform ${open ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}
        aria-label="Open menu"
        onClick={() => setOpen(true)}
        style={{ zIndex: 60 }}
      >
        <span className="block w-7 h-1 bg-luxury-accent rounded transition-all"></span>
        <span className="block w-7 h-1 bg-luxury-accent rounded transition-all"></span>
        <span className="block w-7 h-1 bg-luxury-accent rounded transition-all"></span>
      </button>
      {/* Mobile Nav Drawer - only rendered when open */}
      {open && (
        <div
          className="fixed inset-0 z-[110] pointer-events-auto "
          aria-hidden={!open}
        >
          {/* Overlay */}
          <div
            className="absolute inset-0 transition-opacity  opacity-100"
            onClick={() => setOpen(false)}
          />
          {/* Drawer */}
          <aside
            className="absolute right-0 top-0 h-full w-full sm:w-[480px]  border-l border-white flex flex-col p-12 shadow-2xl transition-transform duration-500 ease-[cubic-bezier(0.4,0,0.2,1)] translate-x-0"
          >
            <button
              className="self-end text-white/40 hover:text-luxury-accent transition-colors text-4xl font-light"
              aria-label="Close menu"
              onClick={() => setOpen(false)}
            >
              ×
            </button>
            
            <nav className="flex flex-col gap-6 mt-12 bg-accent">
              {navLinks.map(link => (
                <Link 
                  key={link.href} 
                  href={link.href} 
                  className="text-4xl font-serif text-white hover:text-luxury-accent transition-colors"
                  onClick={() => setOpen(false)}
                >
                  {link.label}{link.href === '/cart' && count > 0 ? ` [${count}]` : ''}
                </Link>
              ))}
            </nav>

            <div className="mt-auto flex flex-col gap-8 bg-accent">
              <div className="h-px bg-white/5 w-full" />
              
              <div className="flex flex-col gap-2">
                <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-luxury-accent/70">{accountLabel}</p>
                <p className="text-white/50 font-light">{profile?.email || 'GUEST'}</p>
              </div>

              <div className="flex flex-col gap-4">
                {signedIn ? (
                  <button
                    type="button"
                    onClick={handleSignOut}
                    className="w-full rounded-full border border-white/10 py-4 text-xs font-bold uppercase tracking-widest text-white hover:border-luxury-accent hover:text-luxury-accent"
                  >
                    Sign Out
                  </button>
                ) : (
                  <Link 
                    href="/login" 
                    className="w-full rounded-full border border-luxury-accent/50 py-4 text-center text-xs font-bold uppercase tracking-widest text-luxury-accent hover:bg-luxury-accent hover:text-black"
                    onClick={() => setOpen(false)}
                  >
                    Sign In
                  </Link>
                )}
                
                <button
                  type="button"
                  onClick={cycleTheme}
                  className="w-full flex items-center justify-center gap-3 rounded-full bg-white/5 py-4 text-xs font-bold uppercase tracking-widest text-white hover:bg-white/10"
                >
                  <FaPalette className="text-sm" />
                  Theme: {themeLabel}
                </button>

                <Link 
                  href="/book" 
                  className="w-full rounded-full bg-luxury-accent py-5 text-center text-sm font-bold uppercase tracking-widest text-black shadow-2xl"
                  onClick={() => setOpen(false)}
                >
                  Reserve Now
                </Link>
              </div>
            </div>
          </aside>
        </div>
      )}
    </nav>
  );
}
