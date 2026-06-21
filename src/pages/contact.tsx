import { VahaPageHero, VahaPageShell } from '../components/vaha/VahaUI';
import { SITE_HELLO_EMAIL, SITE_INFO_EMAIL } from '../lib/siteContact';

export default function Contact() {
  return (
    <VahaPageShell>
      <VahaPageHero
        eyebrow="Get in Touch"
        title="Contact Us"
        description="We'd love to hear from you. Reach out with questions, feedback, or private hire enquiries."
      />

      <section className="vaha-section bg-vaha-ink-soft">
        <div className="vaha-container mx-auto max-w-xl">
          <form className="flex flex-col gap-5" aria-label="Contact form">
            <label className="flex flex-col gap-2">
              <span className="vaha-eyebrow">Name</span>
              <input
                className="border border-white/15 bg-vaha-ink px-4 py-3 text-vaha-cream placeholder:text-vaha-muted/50 focus:border-vaha-gold focus:outline-none"
                placeholder="Your name"
                required
              />
            </label>
            <label className="flex flex-col gap-2">
              <span className="vaha-eyebrow">Email</span>
              <input
                type="email"
                className="border border-white/15 bg-vaha-ink px-4 py-3 text-vaha-cream placeholder:text-vaha-muted/50 focus:border-vaha-gold focus:outline-none"
                placeholder="you@example.com"
                required
              />
            </label>
            <label className="flex flex-col gap-2">
              <span className="vaha-eyebrow">Message</span>
              <textarea
                className="min-h-[140px] border border-white/15 bg-vaha-ink px-4 py-3 text-vaha-cream placeholder:text-vaha-muted/50 focus:border-vaha-gold focus:outline-none"
                placeholder="How can we help?"
                required
              />
            </label>
            <button
              type="submit"
              className="mt-2 border border-vaha-gold bg-vaha-gold py-3 text-xs font-semibold uppercase tracking-[0.35em] text-vaha-ink transition-colors hover:bg-white hover:border-white"
            >
              Send Message
            </button>
          </form>
          <p className="mt-10 text-center text-sm text-vaha-muted">
            Or email{' '}
            <a href={`mailto:${SITE_INFO_EMAIL}`} className="text-vaha-gold hover:underline">
              {SITE_INFO_EMAIL}
            </a>
            {' '}or{' '}
            <a href={`mailto:${SITE_HELLO_EMAIL}`} className="text-vaha-gold hover:underline">
              {SITE_HELLO_EMAIL}
            </a>
          </p>
        </div>
      </section>
    </VahaPageShell>
  );
}
