import Image from 'next/image';
import Link from 'next/link';
import { FaInstagram, FaFacebookF, FaXTwitter } from './HighEndIcons';

const footerLinks = [
  { href: '/', label: 'Home' },
  { href: '/menu', label: 'Menu' },
  { href: '/info', label: 'About' },
  { href: '/book', label: 'Reservations' },
  { href: '/hours', label: 'Hours' },
  { href: '/events', label: 'Events' },
  { href: '/contact', label: 'Contact' },
  { href: '/legal', label: 'Legal' },
];

export default function Footer() {
  return (
    <footer className="border-t border-white/10 bg-vaha-ink pt-20 pb-10">
      <div className="vaha-container grid gap-12 md:grid-cols-3">
        <div>
          <Link href="/" className="flex items-center gap-3">
            <Image src="/images/logo.png" alt="" width={44} height={44} className="rounded-full border border-vaha-gold/30" />
            <span className="font-serif text-2xl text-vaha-cream">Savannah</span>
          </Link>
          <p className="mt-6 max-w-sm text-sm leading-relaxed text-vaha-muted">
            Ambient dining, wood-fired cuisine, and signature cocktails in Northampton.
          </p>
          <div className="mt-6 flex gap-5 text-xl text-vaha-muted">
            <a href="https://instagram.com/" target="_blank" rel="noopener noreferrer" aria-label="Instagram" className="hover:text-vaha-gold"><FaInstagram /></a>
            <a href="https://facebook.com/" target="_blank" rel="noopener noreferrer" aria-label="Facebook" className="hover:text-vaha-gold"><FaFacebookF /></a>
            <a href="https://twitter.com/" target="_blank" rel="noopener noreferrer" aria-label="X" className="hover:text-vaha-gold"><FaXTwitter /></a>
          </div>
        </div>

        <div>
          <p className="vaha-eyebrow mb-6">Explore</p>
          <nav className="flex flex-col gap-3">
            {footerLinks.map((link) => (
              <Link key={link.href} href={link.href} className="text-sm text-vaha-muted transition-colors hover:text-vaha-cream">
                {link.label}
              </Link>
            ))}
          </nav>
        </div>

        <div>
          <p className="vaha-eyebrow mb-6">Visit</p>
          <address className="not-italic text-sm leading-relaxed text-vaha-muted">
            17 Wellingborough Road<br />
            Northampton, NN1 2AB<br />
            <a href="tel:+44234567890" className="mt-2 inline-block text-vaha-gold hover:underline">+44 234 567 890</a>
            <br />
            <a href="mailto:info@savannah.com" className="hover:underline">info@savannah.com</a>
          </address>
        </div>
      </div>

      <div className="vaha-container mt-16 flex flex-col items-center justify-between gap-4 border-t border-white/10 pt-8 text-[11px] uppercase tracking-[0.2em] text-vaha-muted/50 md:flex-row">
        <span>&copy; 2026 Savannah Bar & Grill</span>
        <div className="flex gap-8">
          <Link href="/legal" className="hover:text-vaha-gold">Privacy</Link>
          <Link href="/legal" className="hover:text-vaha-gold">Terms</Link>
        </div>
      </div>
    </footer>
  );
}
