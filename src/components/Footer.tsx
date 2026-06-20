import Image from 'next/image';
import Link from 'next/link';
import { FaInstagram, FaFacebookF, FaXTwitter, FaTiktok, FaYoutube } from './HighEndIcons';

const footerLinks = [
  { href: '/', label: 'Home' },
  { href: '/menu', label: 'Menu' },
  { href: '/book', label: 'Reservations' },
  { href: '/hours', label: 'Hours' },
  { href: '/info', label: 'About Us' },
  { href: '/events', label: 'Events & Updates' },
  { href: '/contact', label: 'Contact' },
  { href: '/legal', label: 'Legal' },
];

export default function Footer() {
  return (
    <footer className="relative w-full overflow-hidden border-t border-white/5 pt-32 pb-16 px-8 flex flex-col items-center">
      {/* Cinematic Background */}
      <div className="absolute inset-0 -z-10">
        <Image 
          src="/images/bbq3.jpeg" 
          alt="Savannah Atmosphere" 
          fill 
          className="object-cover brightness-[0.08] fixed" 
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/90 to-transparent" />
      </div>

      <div className="w-full max-w-[1700px] grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-20 relative z-10">
        {/* Brand Column */}
        <div className="flex flex-col items-start gap-8">
          <Link href="/" className="flex items-center gap-4 group">
            <Image src="/images/logo.png" alt="Savannah Logo" width={56} height={56} className="rounded-full border border-luxury-accent/30 transition-transform group-hover:scale-110" />
            <span className="font-serif text-3xl text-luxury-accent font-bold tracking-widest uppercase">Savannah</span>
          </Link>
          <p className="text-white/40 text-base leading-relaxed font-light italic">
            Experience fine dining like never before. Savannah Bar & Grill offers a curated menu of exquisite dishes, crafted with passion and precision.
          </p>
          <div className="flex gap-6 text-white/30 text-2xl">
            <a href="https://instagram.com/" target="_blank" rel="noopener" aria-label="Instagram" className="hover:text-luxury-accent transition-colors"><FaInstagram /></a>
            <a href="https://facebook.com/" target="_blank" rel="noopener" aria-label="Facebook" className="hover:text-luxury-accent transition-colors"><FaFacebookF /></a>
            <a href="https://twitter.com/" target="_blank" rel="noopener" aria-label="X" className="hover:text-luxury-accent transition-colors"><FaXTwitter /></a>
          </div>
        </div>

        {/* Navigation Column */}
        <div className="flex flex-col gap-8">
          <h4 className="text-luxury-accent font-bold uppercase tracking-[0.3em] text-xs">Explore</h4>
          <nav className="flex flex-col gap-5">
            {footerLinks.map(link => (
              <Link key={link.href} href={link.href} className="text-white/50 hover:text-white transition-colors text-sm font-light uppercase tracking-widest">
                {link.label}
              </Link>
            ))}
          </nav>
        </div>

        {/* Contact Column */}
        <div className="flex flex-col gap-8">
          <h4 className="text-luxury-accent font-bold uppercase tracking-[0.3em] text-xs">Visit</h4>
          <div className="flex flex-col gap-6 text-white/50 text-base font-light leading-relaxed">
            <p>17 Wellingborough Road<br />Northampton, NN1 2AB</p>
            <p className="text-luxury-accent/80 font-medium">+44 234 567 890</p>
            <p>info@savannah.com</p>
          </div>
        </div>

        {/* Map Column */}
        <div className="flex flex-col gap-8">
          <h4 className="text-luxury-accent font-bold uppercase tracking-[0.3em] text-xs">Location</h4>
          <div className="rounded-[2rem] overflow-hidden border border-white/5 grayscale contrast-[0.8] brightness-[0.6] opacity-40 hover:grayscale-0 hover:opacity-100 transition-all duration-1000 h-48 shadow-2xl">
            <iframe
              title="Savannah Bar & Grill Map"
              src="https://www.openstreetmap.org/export/embed.html?bbox=-81.0998%2C32.0809%2C-81.0898%2C32.0909&amp;layer=mapnik&amp;marker=32.0859%2C-81.0948"
              className="w-full h-full border-0"
              loading="lazy"
            ></iframe>
          </div>
        </div>
      </div>

      <div className="w-full max-w-[1700px] flex flex-col md:flex-row items-center justify-between mt-32 pt-12 border-t border-white/5 relative z-10">
        <span className="text-[11px] text-white/20 uppercase tracking-[0.2em] font-medium">
          &copy; 2026 Savannah Bar & Grill. All rights reserved.
        </span>
        <div className="flex gap-12 mt-6 md:mt-0">
          <Link href="/legal" className="text-[11px] text-white/20 uppercase tracking-[0.2em] font-medium hover:text-luxury-accent">Privacy Policy</Link>
          <Link href="/legal" className="text-[11px] text-white/20 uppercase tracking-[0.2em] font-medium hover:text-luxury-accent">Terms of Service</Link>
        </div>
      </div>
      <p className="absolute bottom-4 text-[10px] text-white/10 uppercase tracking-[0.2em] font-medium">
        Designed & delivered by <a href="https://me.devpete.co.uk" target="_blank" rel="noopener" className="hover:text-luxury-accent transition-colors">Dev Pete</a>
      </p>
    </footer>
  );
}
