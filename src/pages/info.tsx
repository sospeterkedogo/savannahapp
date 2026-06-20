import Image from 'next/image';
import Link from 'next/link';

const ParallaxSection = ({ 
  imageSrc, 
  title, 
  subtitle, 
  content, 
  align = 'left' 
}: { 
  imageSrc: string; 
  title: string; 
  subtitle?: string; 
  content: string; 
  align?: 'left' | 'right';
}) => (
  <section className="relative min-h-screen w-full overflow-hidden flex items-center py-32">
    {/* Fixed Background Image */}
    <div className="absolute inset-0 -z-10">
      <Image 
        src={imageSrc} 
        alt={title}
        fill 
        className="object-cover brightness-[0.25] fixed transition-transform duration-500 scale-105" 
      />
    </div>

    <div className={`relative z-10 w-full px-8 md:px-32 flex ${align === 'right' ? 'justify-end' : 'justify-start'}`}>
      <div className="max-w-4xl luxury-fade-in space-y-12 bg-black/30 backdrop-blur-xl p-16 md:p-24 rounded-[4rem] border border-white/5 shadow-[0_32px_64px_rgba(0,0,0,0.8)]">
        {subtitle && (
          <span className="text-luxury-accent font-bold tracking-[0.6em] uppercase text-xs block">
            {subtitle}
          </span>
        )}
        <h2 className="text-6xl md:text-8xl font-serif font-bold text-white leading-tight tracking-tighter">
          {title}
        </h2>
        <div className="h-px w-32 bg-luxury-accent/50" />
        <p className="text-2xl md:text-3xl text-white/80 leading-relaxed font-light italic">
          {content}
        </p>
      </div>
    </div>
  </section>
);

export default function Info() {
  return (
    <div className="bg-black text-white">
      {/* 1. Hero Section */}
      <section className="relative h-screen flex flex-col justify-center items-center text-center px-4">
        <div className="absolute inset-0 -z-10">
          <Image 
            src="/images/about-bbq.jpeg" 
            alt="Savannah Heritage" 
            fill 
            priority
            className="object-cover brightness-[0.35] fixed" 
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-transparent to-black" />
        </div>
        <div className="relative z-10 max-w-5xl space-y-12 luxury-fade-in">
          <span className="text-luxury-accent font-bold tracking-[0.8em] uppercase text-xs">Our Story</span>
          <h1 className="text-8xl md:text-[14rem] font-serif font-bold text-luxury-accent leading-none tracking-tighter">
            Heritage
          </h1>
          <p className="text-3xl md:text-5xl text-white/90 font-light italic tracking-tight">
            A tradition of fire, flavor, and finesse.
          </p>
        </div>
        
        <div className="absolute bottom-20 left-1/2 -translate-x-1/2 flex flex-col items-center gap-4 opacity-30">
          <span className="text-[10px] uppercase tracking-[0.4em] font-bold">Scroll to Explore</span>
          <div className="h-16 w-px bg-gradient-to-b from-luxury-accent to-transparent" />
        </div>
      </section>

      {/* 2. The Flame */}
      <ParallaxSection 
        imageSrc="/images/about-meat.jpeg"
        subtitle="The Technique"
        title="The Flame"
        content="At the heart of Savannah is our custom wood-fire grill. We believe that fire is the purest way to cook, bringing out the raw essence of every ingredient. Our pitmasters source only the finest local hardwoods to infuse every cut with a signature smoky soul."
        align="right"
      />

      {/* 3. The Process - New Section */}
      <ParallaxSection 
        imageSrc="/images/bbq2.jpeg"
        subtitle="Slow & Low"
        title="The Process"
        content="Patience is our most vital ingredient. From 12-hour oak-smoked briskets to precisely aged ribeyes, our culinary process honors the time required to achieve perfection. Every dish is a testament to the discipline of the craft."
        align="left"
      />

      {/* 4. The Catch */}
      <ParallaxSection 
        imageSrc="/images/about-fish.jpeg"
        subtitle="Sourced with Care"
        title="The Catch"
        content="Beyond the grill, we celebrate the bounty of the ocean. Each morning, we select the finest sustainable seafood, prepared with precision to balance the intensity of our fire-driven menu."
        align="right"
      />

      {/* 5. The Cuisine - New Section */}
      <ParallaxSection 
        imageSrc="/images/chapsoup.jpeg"
        subtitle="Global Inspiration"
        title="The Cuisine"
        content="Our menu is a curated journey across continents, blending traditional wood-fire techniques with modern gastronomic innovation. We strive to create a harmonious dialogue between the rustic and the refined."
        align="left"
      />

      {/* 6. The Bar */}
      <ParallaxSection 
        imageSrc="/images/about-drinks.jpeg"
        subtitle="Artisan Spirits"
        title="The Bar"
        content="A meal at Savannah is not complete without a journey through our bar. From rare single malts to our signature Gold-infused cocktails, our mixologists craft experiences that complement the heat of the kitchen."
        align="right"
      />

      {/* Final CTA */}
      <section className="relative py-60 bg-black text-center overflow-hidden">
        <div className="absolute inset-0 -z-10 opacity-20">
          <Image src="/images/bbq3.jpeg" alt="Savannah Atmosphere" fill className="object-cover" />
        </div>
        
        <div className="max-w-[1700px] mx-auto space-y-16 luxury-fade-in relative z-10 px-8">
          <h2 className="text-7xl md:text-9xl font-serif font-bold leading-tight">Join the Legacy</h2>
          <p className="text-2xl md:text-3xl text-white/70 font-light max-w-3xl mx-auto italic">
            Experience the fusion of luxury and raw fire. We invite you to share a table and a story with us.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-12 pt-12">
            <Link href="/book" className="px-16 py-8 bg-luxury-accent text-black rounded-full font-bold text-2xl hover:bg-white transition-all shadow-[0_0_50px_rgba(197,160,89,0.3)]">
              Reserve Your Table
            </Link>
            <Link href="/menu" className="px-16 py-8 border-2 border-luxury-accent text-luxury-accent rounded-full font-bold text-2xl hover:bg-luxury-accent hover:text-black transition-all">
              Explore the Menu
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
