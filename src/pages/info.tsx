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
        eyebrow="About Us"
        title="About Savannah"
        description="A restaurant and bar on Wellingborough Road in Northampton."
        imageSrc="/images/about-bbq.jpeg"
      />

      <VahaStoryBlock title="Our Story">
        <p>
          Savannah Bar & Grill sits on a busy corner of Wellingborough Road. We have a dining room and bar where you can eat, drink, and relax.
        </p>
        <p>
          Our team loves good food, good drinks, and making guests feel welcome.
        </p>
      </VahaStoryBlock>

      <section className="vaha-section bg-vaha-ink-soft">
        <div className="vaha-container grid items-center gap-6 lg:grid-cols-2 lg:gap-8">
          <div className="relative aspect-[4/5] overflow-hidden border border-white/10">
            <Image src="/images/about-meat.jpeg" alt="Food on the grill" fill className="object-cover" sizes="(max-width: 1024px) 100vw, 50vw" />
          </div>
          <div className="space-y-6">
            <p className="vaha-eyebrow">The Grill</p>
            <h2 className="vaha-title">Wood-Fire Cooking</h2>
            <p className="text-vaha-muted leading-relaxed">
              Most of our mains are cooked on a wood-fire grill. Fire brings out strong, smoky flavours in meat, fish, and vegetables.
            </p>
          </div>
        </div>
      </section>

      <VahaFeatureGrid
        sectionTitle="Our Space"
        items={[
          {
            label: 'Dining room',
            title: 'Eat In',
            body: 'A calm room for lunch or dinner — good for couples, families, or groups of friends.',
            image: '/images/bbq3.jpeg',
          },
          {
            label: 'The bar',
            title: 'Drinks',
            body: 'Beer, wine, soft drinks, and house cocktails. Try Savannah Gold or ask our team for a suggestion.',
            image: '/images/about-drinks.jpeg',
          },
          {
            label: 'Fresh fish',
            title: 'Seafood',
            body: 'We pick fresh fish and cook it simply so it pairs well with our grilled dishes.',
            image: '/images/about-fish.jpeg',
          },
          {
            label: 'The food',
            title: 'Our Kitchen',
            body: 'Grilled meats, share plates, and sides — simple food done well over open flame.',
            image: '/images/chapsoup.jpeg',
          },
        ]}
      />

      <section className="vaha-section border-t border-white/10 text-center">
        <div className="vaha-container space-y-8">
          <h2 className="vaha-title-sm">Come and See Us</h2>
          <p className="mx-auto max-w-2xl text-vaha-muted">
            Book a table or walk in. We would love to have you.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <VahaCta href="/book" variant="solid">Book a Table</VahaCta>
            <VahaCta href="/menu">See the Menu</VahaCta>
          </div>
        </div>
      </section>
    </VahaPageShell>
  );
}
