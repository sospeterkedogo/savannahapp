import {
  VahaCta,
  VahaFeatureGrid,
  VahaHeroSection,
  VahaPageShell,
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
      <VahaHeroSection
        imageSrc={LANDING_IMAGES[0]}
        imageAlt="Inside Savannah Bar and Grill"
        priority
        imageClassName="brightness-[0.4]"
        overlayClassName="bg-gradient-to-t from-vaha-ink via-vaha-ink/40 to-transparent"
        className="min-h-screen flex-col justify-end"
      >
        <div className="vaha-container pb-12 pt-24 md:pb-14">
          <p className="vaha-eyebrow mb-6">Northampton</p>
          <h1 className="vaha-title-lg max-w-5xl">
            Savannah <span className="italic text-vaha-gold">Bar & Grill</span>
          </h1>
          <p className="mt-8 max-w-xl text-lg leading-relaxed text-vaha-muted md:text-xl">
            Good food from the grill, cold drinks, and a warm place to eat on Wellingborough Road.
          </p>
          <div className="mt-10 flex flex-wrap gap-4">
            <VahaCta href="/menu" variant="solid">
              See Menu
            </VahaCta>
            <VahaCta href="/book">Book a Table</VahaCta>
          </div>
        </div>
      </VahaHeroSection>

      <VahaStoryBlock title="About Us">
        <p>
          Savannah is a restaurant and bar in the centre of Northampton. We serve grilled food, share plates, and drinks in a relaxed room.
        </p>
        <p>We would love to see you. Walk in or book a table online.</p>
      </VahaStoryBlock>

      <VahaSplitSection
        eyebrow="Food"
        title="Our Menu"
        body="Steaks, burgers, salads, and plates from our wood-fire grill. We use fresh ingredients and cook over open flame."
        cta="See Menu"
        href="/menu"
        imageSrc={LANDING_IMAGES[1]}
        imageAlt="Food on the grill"
      />

      <VahaSplitSection
        eyebrow="Drinks"
        title="Bar & Cocktails"
        body="Beer, wine, soft drinks, and house cocktails. Try Savannah Gold or ask our team for a recommendation."
        cta="See Drinks"
        href="/menu/cocktail"
        imageSrc={LANDING_IMAGES[2]}
        imageAlt="Drinks at the bar"
        reverse
      />

      <VahaFeatureGrid
        sectionTitle="Our Space"
        items={[
          {
            label: 'Dining room',
            title: 'Eat In',
            body: 'Sit down with friends or family. Soft lighting and a calm room for lunch or dinner.',
            image: LANDING_IMAGES[3],
          },
          {
            label: 'The bar',
            title: 'Drinks',
            body: 'Pull up a stool for a pint, a glass of wine, or a cocktail before or after your meal.',
            image: LANDING_IMAGES[4],
          },
          {
            label: 'The grill',
            title: 'Fire Cooking',
            body: 'Most of our mains are cooked over wood fire for a deep, smoky taste.',
            image: LANDING_IMAGES[5],
          },
          {
            label: 'Visit us',
            title: 'Welcome',
            body: 'We aim to make every visit easy and enjoyable — good food, fair prices, friendly staff.',
            image: LANDING_IMAGES[0],
          },
        ]}
      />

      <section className="border-y border-white/10 bg-vaha-ink-soft py-10">
        <div className="vaha-container grid gap-8 md:grid-cols-2">
          <div>
            <p className="vaha-eyebrow mb-4">Find Us</p>
            <h2 className="vaha-title-sm">Hours & Address</h2>
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

      <VahaHeroSection
        imageSrc={LANDING_IMAGES[0]}
        imageClassName="brightness-[0.2]"
        overlayClassName="bg-vaha-ink/70"
        className="vaha-section min-h-[320px] justify-center text-center"
      >
        <div className="vaha-container">
          <h2 className="vaha-title mb-6">Visit Tonight</h2>
          <p className="mx-auto mb-10 max-w-xl text-lg text-vaha-muted">
            Book a table online in a few clicks.
          </p>
          <VahaCta href="/book" variant="solid">
            Book a Table
          </VahaCta>
        </div>
      </VahaHeroSection>
    </VahaPageShell>
  );
}
