import Link from 'next/link';
import {
  VahaCta,
  VahaFeatureGrid,
  VahaPageShell,
  VahaReliableImage,
  VahaSplitSection,
  VahaStoryBlock,
} from '../components/vaha/VahaUI';

const LANDING_IMAGES = [
  '/images/bbq3.jpeg',
  '/images/grilling-p.jpg',
  '/images/burger-drinks-p.jpg',
  '/images/about-bbq.jpeg',
  '/images/about-drinks.jpeg',
  '/images/meat-w.jpg',
  '/images/bbq3.jpeg',
];

export default function Home() {
  return (
    <VahaPageShell>
      <section className="relative flex min-h-screen flex-col justify-end overflow-hidden">
        <VahaReliableImage
          src={LANDING_IMAGES[0]}
          alt="Savannah Bar and Grill dining room"
          fill
          priority
          className="brightness-[0.4]"
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-vaha-ink via-vaha-ink/40 to-transparent" aria-hidden="true" />

        <div className="vaha-container relative z-10 pb-12 pt-24 md:pb-14">
          <p className="vaha-eyebrow mb-6">Northampton &bull; Est. 2026</p>
          <h1 className="vaha-title-lg max-w-5xl">
            Savannah <span className="italic text-vaha-gold">Bar & Grill</span>
          </h1>
          <p className="mt-8 max-w-xl text-lg leading-relaxed text-vaha-muted md:text-xl">
            Ambient dining, wood-fired cuisine, and signature cocktails in the heart of Wellingborough Road.
          </p>
          <div className="mt-10 flex flex-wrap gap-4">
            <VahaCta href="/menu" variant="solid">
              The Menu Library
            </VahaCta>
            <VahaCta href="/book">Reserve a Table</VahaCta>
          </div>
        </div>
      </section>

      <VahaStoryBlock>
        <p>
          Savannah Bar & Grill is a new gastro-bar in the centre of Northampton, boasting an ambient dining
          experience, an extensive bar selection, and the warmth of open-flame cooking.
        </p>
        <p>Come along and experience something completely new.</p>
      </VahaStoryBlock>

      <VahaSplitSection
        eyebrow="Unique Cuisine"
        title="Check out Our Menus"
        body="For those with pure food indulgence in mind, experience our grill-led menu inspired by global smoke-house traditions. We take inspiration from wood-fire technique, premium cuts, and seasonal produce to craft the Savannah signature."
        cta="The Menu Library"
        href="/menu"
        imageSrc={LANDING_IMAGES[1]}
        imageAlt="Wood-fired grill at Savannah"
      />

      <VahaSplitSection
        eyebrow="The perfect Pour"
        title="Mixology Magic"
        body="Savannah boasts an exciting beverages menu featuring cocktails crafted in-house. Our team discovers new flavour pairings and techniques to elevate the art of spirits — from Savannah Gold to classic martinis."
        cta="Discover the Art of Mixology"
        href="/menu/cocktail"
        imageSrc={LANDING_IMAGES[2]}
        imageAlt="Cocktails at Savannah bar"
        reverse
      />

      <VahaFeatureGrid
        sectionTitle="explore Our Space"
        items={[
          {
            label: 'The Dining Space',
            title: 'Savannah Dining',
            body: 'Soft ambient lighting and golden accents create intimacy for every occasion — from intimate dinners to celebrations with friends.',
            image: LANDING_IMAGES[3],
          },
          {
            label: 'Quality Mixology',
            title: 'Savannah Bar',
            body: 'Impeccable mixology shines through every pour. From beautiful flavour pairings to immersive presentation, our bar is unmatched.',
            image: LANDING_IMAGES[4],
          },
          {
            label: 'Delicious Food',
            title: 'The Grill',
            body: 'Wood-fired flavour pushes through every bite of our signature dishes. Our kitchen team brings knowledge in taste, colour, and quality.',
            image: LANDING_IMAGES[5],
          },
          {
            label: 'Our Legacy',
            title: 'The Experience',
            body: 'Crafted for those who appreciate real flavour — special selections, chef-driven menus, and world-class hospitality.',
            image: LANDING_IMAGES[0],
          },
        ]}
      />

      <section className="border-y border-white/10 bg-vaha-ink-soft py-10">
        <div className="vaha-container grid gap-8 md:grid-cols-2">
          <div>
            <p className="vaha-eyebrow mb-4">Visit Us</p>
            <h2 className="vaha-title-sm">Hours & Location</h2>
            <p className="mt-6 leading-relaxed text-vaha-muted">
              17 Wellingborough Road, Northampton, NN1 2AB
              <br />
              <a href="tel:+44234567890" className="text-vaha-gold hover:underline">
                +44 234 567 890
              </a>
            </p>
          </div>
          <table className="w-full text-sm text-vaha-muted md:text-base">
            <tbody>
              <tr className="border-b border-white/5"><td className="py-3">Mon – Thu</td><td className="py-3 text-right">12:00 – 23:00</td></tr>
              <tr className="border-b border-white/5"><td className="py-3">Friday</td><td className="py-3 text-right">12:00 – 00:00</td></tr>
              <tr className="border-b border-white/5"><td className="py-3">Saturday</td><td className="py-3 text-right">12:00 – 00:00</td></tr>
              <tr><td className="py-3">Sunday</td><td className="py-3 text-right">10:00 – 22:00</td></tr>
            </tbody>
          </table>
        </div>
      </section>

      <section className="vaha-section relative overflow-hidden text-center">
        <VahaReliableImage src={LANDING_IMAGES[0]} alt="" fill className="brightness-[0.2]" sizes="100vw" />
        <div className="absolute inset-0 bg-vaha-ink/70" aria-hidden="true" />
        <div className="vaha-container relative z-10">
          <h2 className="vaha-title mb-6">Join Us Tonight</h2>
          <p className="mx-auto mb-10 max-w-xl text-lg text-vaha-muted">
            Secure your table and experience the best of Savannah Bar & Grill.
          </p>
          <VahaCta href="/book" variant="solid">
            Reserve Now
          </VahaCta>
        </div>
      </section>
    </VahaPageShell>
  );
}
