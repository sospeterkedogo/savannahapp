import Image from 'next/image';
import Link from 'next/link';
import { FaInstagram, FaFacebookF, FaXTwitter } from './HighEndIcons';
import { SITE_HELLO_EMAIL, SITE_INFO_EMAIL } from '../lib/siteContact';

const footerLinks = [
  { href: '/', label: 'Home' },
  { href: '/menu', label: 'Menu' },
  { href: '/info', label: 'About' },
  { href: '/book', label: 'Book a Table' },
  { href: '/hours', label: 'Hours' },
  { href: '/events', label: 'Events' },
  { href: '/contact', label: 'Contact' },
  { href: '/legal', label: 'Legal' },
];

export default function Footer() {
  return (
    <footer className="border-t border-white/10 bg-vaha-ink pt-10 pb-6">
      <div className="vaha-container grid gap-8 lg:grid-cols-[1.2fr_1fr] lg:gap-6">
        <div>
          <Link href="/" className="flex items-center gap-3">
            <Image src="/images/logo.png" alt="" width={40} height={40} className="rounded-full border border-vaha-gold/30" />
            <span className="font-serif text-2xl text-vaha-cream md:text-3xl">Savannah</span>
          </Link>
          <p className="mt-4 max-w-md text-sm leading-relaxed text-vaha-muted">
            Grilled food, cold drinks, and a warm welcome in Northampton.
          </p>
          <div className="mt-4 flex gap-4 text-lg text-vaha-muted">
            <a href="https://instagram.com/" target="_blank" rel="noopener noreferrer" aria-label="Instagram" className="hover:text-vaha-gold"><FaInstagram /></a>
            <a href="https://facebook.com/" target="_blank" rel="noopener noreferrer" aria-label="Facebook" className="hover:text-vaha-gold"><FaFacebookF /></a>
            <a href="https://twitter.com/" target="_blank" rel="noopener noreferrer" aria-label="X" className="hover:text-vaha-gold"><FaXTwitter /></a>
          </div>
        </div>

        <nav className="grid gap-2 sm:grid-cols-2" aria-label="Footer">
          {footerLinks.map((link) => (
            <Link key={link.href} href={link.href} className="vaha-footer-link">
              {link.label}
            </Link>
          ))}
        </nav>
      </div>

      <div className="vaha-container mt-8 flex flex-col gap-3 border-t border-white/10 pt-6 text-[10px] uppercase tracking-[0.2em] text-vaha-muted/50 sm:flex-row sm:items-center sm:justify-between">
        <span>&copy; 2026 Savannah Bar & Grill</span>
        <div className="flex gap-6">
          <Link href="/legal" className="hover:text-vaha-gold">Privacy</Link>
          <Link href="/legal" className="hover:text-vaha-gold">Terms</Link>
        </div>
      </div>

      <address className="vaha-container mt-6 not-italic text-xs text-vaha-muted">
        17 Wellingborough Road, Northampton, NN1 2AB &bull;{' '}
        <a href="tel:+44234567890" className="text-vaha-gold hover:underline">+44 234 567 890</a>
        {' '}&bull;{' '}
        <a href={`mailto:${SITE_INFO_EMAIL}`} className="hover:underline">{SITE_INFO_EMAIL}</a>
        {' '}&bull;{' '}
        <a href={`mailto:${SITE_HELLO_EMAIL}`} className="hover:underline">{SITE_HELLO_EMAIL}</a>
      </address>
    </footer>
  );
}
