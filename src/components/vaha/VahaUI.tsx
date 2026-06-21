import Image from 'next/image';
import Link from 'next/link';
import type { ReactNode } from 'react';

/** Split headline: small caps eyebrow + large display title (Vaha pattern). */
export function VahaHeadline({
  eyebrow,
  title,
  className = '',
}: {
  eyebrow: string;
  title: string;
  className?: string;
}) {
  return (
    <div className={className}>
      <p className="vaha-eyebrow">{eyebrow}</p>
      <h2 className="vaha-title mt-3">{title}</h2>
    </div>
  );
}

export function VahaCta({
  href,
  children,
  variant = 'outline',
}: {
  href: string;
  children: ReactNode;
  variant?: 'outline' | 'solid';
}) {
  const base =
    'inline-block border px-8 py-3 text-xs font-semibold uppercase tracking-[0.35em] transition-colors duration-300';
  const styles =
    variant === 'solid'
      ? 'border-vaha-gold bg-vaha-gold text-vaha-ink hover:bg-white hover:border-white'
      : 'border-vaha-gold/60 text-vaha-gold hover:bg-vaha-gold hover:text-vaha-ink';

  return (
    <Link href={href} className={`${base} ${styles}`}>
      {children}
    </Link>
  );
}

export function VahaStoryBlock({
  title = 'Explore Our Story',
  children,
}: {
  title?: string;
  children: ReactNode;
}) {
  return (
    <section className="vaha-section bg-vaha-ink">
      <div className="vaha-container max-w-3xl text-center">
        <h2 className="vaha-title-sm mb-8">{title}</h2>
        <div className="space-y-6 text-base leading-relaxed text-vaha-muted md:text-lg">{children}</div>
      </div>
    </section>
  );
}

export function VahaSplitSection({
  eyebrow,
  title,
  body,
  cta,
  href,
  imageSrc,
  imageAlt,
  reverse = false,
}: {
  eyebrow: string;
  title: string;
  body: string;
  cta: string;
  href: string;
  imageSrc: string;
  imageAlt: string;
  reverse?: boolean;
}) {
  return (
    <section className="vaha-section bg-vaha-ink-soft">
      <div className={`vaha-container grid items-center gap-12 lg:grid-cols-2 lg:gap-20 ${reverse ? 'lg:[&>*:first-child]:order-2' : ''}`}>
        <div className="relative aspect-[4/5] overflow-hidden border border-white/10">
          <Image src={imageSrc} alt={imageAlt} fill className="object-cover" sizes="(max-width: 1024px) 100vw, 50vw" />
          <div className="absolute inset-0 bg-gradient-to-t from-vaha-ink/50 to-transparent" aria-hidden="true" />
        </div>
        <div className="space-y-8">
          <VahaHeadline eyebrow={eyebrow} title={title} />
          <p className="max-w-xl text-base leading-relaxed text-vaha-muted md:text-lg">{body}</p>
          <VahaCta href={href}>{cta}</VahaCta>
        </div>
      </div>
    </section>
  );
}

export function VahaFeatureGrid({
  sectionTitle,
  items,
}: {
  sectionTitle: string;
  items: { label: string; title: string; body: string; image: string }[];
}) {
  return (
    <section className="vaha-section bg-vaha-ink">
      <div className="vaha-container">
        <h2 className="vaha-title mb-16 text-center">{sectionTitle}</h2>
        <div className="grid gap-10 md:grid-cols-2">
          {items.map((item) => (
            <article key={item.label} className="group border border-white/10 bg-vaha-ink-soft p-6 md:p-8">
              <div className="relative mb-6 aspect-[16/10] overflow-hidden">
                <Image
                  src={item.image}
                  alt=""
                  fill
                  className="object-cover transition-transform duration-700 group-hover:scale-105"
                  sizes="(max-width: 768px) 100vw, 50vw"
                />
              </div>
              <p className="vaha-eyebrow">{item.label}</p>
              <h3 className="mt-2 font-serif text-2xl text-vaha-cream md:text-3xl">{item.title}</h3>
              <p className="mt-4 text-sm leading-relaxed text-vaha-muted md:text-base">{item.body}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

export function VahaPageHero({
  eyebrow,
  title,
  description,
  imageSrc,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  imageSrc?: string;
}) {
  return (
    <section className="relative flex min-h-[50vh] items-end overflow-hidden border-b border-white/10 pb-16 pt-28 md:min-h-[55vh] md:pb-20">
      {imageSrc ? (
        <>
          <Image src={imageSrc} alt="" fill priority className="object-cover brightness-[0.35]" sizes="100vw" />
          <div className="absolute inset-0 bg-gradient-to-t from-vaha-ink via-vaha-ink/60 to-vaha-ink/30" aria-hidden="true" />
        </>
      ) : null}
      <div className="vaha-container relative z-10">
        {eyebrow ? <p className="vaha-eyebrow mb-4">{eyebrow}</p> : null}
        <h1 className="vaha-title-lg max-w-4xl">{title}</h1>
        {description ? <p className="mt-6 max-w-2xl text-lg text-vaha-muted">{description}</p> : null}
      </div>
    </section>
  );
}

export function VahaPageShell({ children }: { children: ReactNode }) {
  return <div className="bg-vaha-ink text-vaha-cream">{children}</div>;
}
