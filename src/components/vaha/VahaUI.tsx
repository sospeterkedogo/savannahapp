import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useState, type ReactNode } from 'react';

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
  className = '',
}: {
  href: string;
  children: ReactNode;
  variant?: 'outline' | 'solid';
  className?: string;
}) {
  const base =
    'inline-block border px-8 py-3 text-xs font-semibold uppercase tracking-[0.35em] transition-colors duration-300';
  const styles =
    variant === 'solid'
      ? 'border-vaha-gold bg-vaha-gold text-vaha-ink hover:bg-white hover:border-white'
      : 'border-vaha-gold/60 text-vaha-gold hover:bg-vaha-gold hover:text-vaha-ink';

  return (
    <Link href={href} className={`${base} ${styles} ${className}`}>
      {children}
    </Link>
  );
}

export function VahaStoryBlock({
  title = 'Our Story',
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
      <div className={`vaha-container grid items-center gap-6 lg:grid-cols-2 lg:gap-8 ${reverse ? 'lg:[&>*:first-child]:order-2' : ''}`}>
        <div className="relative aspect-[4/5] overflow-hidden border border-white/10">
          <VahaReliableImage src={imageSrc} alt={imageAlt} fill sizes="(max-width: 1024px) 100vw, 50vw" />
          <div className="absolute inset-0 bg-gradient-to-t from-vaha-ink/50 to-transparent" aria-hidden="true" />
        </div>
        <div className="space-y-5">
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
        <h2 className="vaha-title mb-8 text-center">{sectionTitle}</h2>
        <div className="grid gap-4 md:grid-cols-2 md:gap-5">
          {items.map((item) => (
            <article key={item.label} className="group border border-white/10 bg-vaha-ink-soft p-4 md:p-5">
              <div className="relative mb-6 aspect-[16/10] overflow-hidden">
                <VahaReliableImage src={item.image} alt="" fill sizes="(max-width: 768px) 100vw, 50vw" className="transition-transform duration-700 group-hover:scale-105" />
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
    <section className="relative flex min-h-[42vh] items-end overflow-hidden border-b border-white/10 pb-8 pt-24 md:min-h-[48vh] md:pb-10">
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

/** Shared form + panel styles for account, cart, staff pages */
export const vahaInputClass =
  'min-h-11 w-full border border-white/15 bg-vaha-ink px-3 py-2 text-sm text-vaha-cream placeholder:text-vaha-muted/50 focus:border-vaha-gold focus:outline-none focus:ring-1 focus:ring-vaha-gold';

export const vahaTextareaClass = `${vahaInputClass} min-h-24`;

export function VahaPanel({
  children,
  className = '',
  eyebrow,
  title,
  description,
}: {
  children?: ReactNode;
  className?: string;
  eyebrow?: string;
  title?: string;
  description?: string;
}) {
  return (
    <section className={`border border-white/10 bg-vaha-ink-soft p-4 md:p-5 ${className}`}>
      {eyebrow ? <p className="vaha-eyebrow mb-2">{eyebrow}</p> : null}
      {title ? <h2 className="font-serif text-2xl text-vaha-cream md:text-3xl">{title}</h2> : null}
      {description ? <p className="mt-2 text-sm text-vaha-muted md:text-base">{description}</p> : null}
      {children}
    </section>
  );
}

export function VahaButton({
  children,
  type = 'button',
  variant = 'solid',
  disabled,
  className = '',
  onClick,
}: {
  children: ReactNode;
  type?: 'button' | 'submit';
  variant?: 'solid' | 'outline' | 'ghost';
  disabled?: boolean;
  className?: string;
  onClick?: () => void;
}) {
  const base =
    'inline-flex min-h-11 items-center justify-center border px-6 py-2 text-xs font-semibold uppercase tracking-[0.25em] transition-colors disabled:cursor-not-allowed disabled:opacity-50';
  const styles =
    variant === 'solid'
      ? 'border-vaha-gold bg-vaha-gold text-vaha-ink hover:bg-white hover:border-white'
      : variant === 'outline'
        ? 'border-vaha-gold/60 text-vaha-gold hover:bg-vaha-gold hover:text-vaha-ink'
        : 'border-transparent text-vaha-muted hover:text-vaha-gold';

  return (
    <button type={type} disabled={disabled} onClick={onClick} className={`${base} ${styles} ${className}`}>
      {children}
    </button>
  );
}

export function VahaAlert({ tone, children }: { tone: 'error' | 'success' | 'info'; children: ReactNode }) {
  const styles =
    tone === 'error'
      ? 'border-red-400/40 bg-red-950/40 text-red-100'
      : tone === 'success'
        ? 'border-green-400/40 bg-green-950/30 text-green-100'
        : 'border-vaha-gold/30 bg-vaha-gold/5 text-vaha-cream';
  return <p className={`border px-4 py-3 text-sm ${styles}`}>{children}</p>;
}

export function VahaLoading({ label = 'Loading…' }: { label?: string }) {
  return (
    <div className="flex min-h-[40vh] items-center justify-center">
      <p className="vaha-eyebrow" role="status" aria-live="polite">
        {label}
      </p>
    </div>
  );
}

/** Landing / hero image with load validation and fresh mount per navigation */
export function VahaReliableImage({
  src,
  alt,
  fill,
  priority,
  className = '',
  sizes,
  aspectClassName,
}: {
  src: string;
  alt: string;
  fill?: boolean;
  priority?: boolean;
  className?: string;
  sizes?: string;
  aspectClassName?: string;
}) {
  const [status, setStatus] = useState<'loading' | 'loaded' | 'error'>('loading');

  return (
    <div className={aspectClassName || (fill ? 'absolute inset-0' : 'relative aspect-[16/10] w-full')}>
      {status === 'error' ? (
        <div className="flex h-full min-h-[12rem] items-center justify-center border border-red-400/30 bg-vaha-ink-soft p-4 text-center text-sm text-red-200">
          Image unavailable: {src}
        </div>
      ) : (
        <Image
          key={src}
          src={src}
          alt={alt}
          fill={fill}
          priority={priority}
          sizes={sizes}
          className={`object-cover ${className} ${status === 'loading' ? 'opacity-0' : 'opacity-100'} transition-opacity duration-500`}
          onLoad={() => setStatus('loaded')}
          onError={() => setStatus('error')}
        />
      )}
    </div>
  );
}
