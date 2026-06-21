import Image from 'next/image';
import Link from 'next/link';
import {
  VahaCta,
  VahaFeatureGrid,
  VahaPageHero,
  VahaPageShell,
  VahaStoryBlock,
} from '../components/vaha/VahaUI';

export default function Info() {
  return (
    <VahaPageShell>
      <VahaPageHero
        eyebrow="Our Story"
        title="About Savannah"
        description="A tradition of fire, flavour, and finesse on Northampton's Wellingborough Road."
        imageSrc="/images/about-bbq.jpeg"
      />

      <VahaStoryBlock title="Our Story">
        <p>
          Savannah Bar & Grill is a restaurant and bar located on a busy corner of Northampton&apos;s Wellingborough Road.
          With an ambient dining space and stylish lounge overlooking the bustling street, we invite you to slow down and savour.
        </p>
        <p>
          Our talents and experience are diverse, but at Savannah we&apos;re united by one thing: an overarching passion
          for food, mixology, and hospitality.
        </p>
      </VahaStoryBlock>

      <section className="vaha-section bg-vaha-ink-soft">
        <div className="vaha-container grid items-center gap-6 lg:grid-cols-2 lg:gap-8">
          <div className="relative aspect-[4/5] overflow-hidden border border-white/10">
            <Image src="/images/about-meat.jpeg" alt="Wood-fire grill" fill className="object-cover" sizes="(max-width: 1024px) 100vw, 50vw" />
          </div>
          <div className="space-y-6">
            <p className="vaha-eyebrow">The Technique</p>
            <h2 className="vaha-title">The Flame</h2>
            <p className="text-vaha-muted leading-relaxed">
              At the heart of Savannah is our custom wood-fire grill. Fire is the purest way to cook — bringing out the raw
              essence of every ingredient with locally sourced hardwoods and patient craft.
            </p>
          </div>
        </div>
      </section>

      <VahaFeatureGrid
        sectionTitle="explore Our Space"
        items={[
          {
            label: 'The Dining Space',
            title: 'Ambient Dining',
            body: 'Whether an intimate dinner for two or a celebration with friends, our dining space offers the perfect setting with golden accents and warm lighting.',
            image: '/images/bbq2.jpeg',
          },
          {
            label: 'Quality Mixology',
            title: 'Savannah Bar',
            body: 'From rare single malts to signature Gold-infused cocktails, our mixologists craft experiences that complement the heat of the kitchen.',
            image: '/images/about-drinks.jpeg',
          },
          {
            label: 'The Catch',
            title: 'Sourced with Care',
            body: 'Each morning we select sustainable seafood, prepared with precision to balance the intensity of our fire-driven menu.',
            image: '/images/about-fish.jpeg',
          },
          {
            label: 'The Cuisine',
            title: 'Global Inspiration',
            body: 'A curated journey blending wood-fire tradition with modern gastronomy — rustic soul meets refined technique.',
            image: '/images/chapsoup.jpeg',
          },
        ]}
      />

      <section className="vaha-section border-t border-white/10 text-center">
        <div className="vaha-container space-y-8">
          <h2 className="vaha-title-sm">Join the Legacy</h2>
          <p className="mx-auto max-w-2xl text-vaha-muted">
            Experience the fusion of luxury and raw fire. We invite you to share a table and a story with us.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <VahaCta href="/book" variant="solid">Reserve Your Table</VahaCta>
            <VahaCta href="/menu">Explore the Menu</VahaCta>
          </div>
        </div>
      </section>
    </VahaPageShell>
  );
}
