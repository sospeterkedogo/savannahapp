import type { ReactNode } from 'react';

interface GlassCardProps {
  children: ReactNode;
  className?: string;
  hover?: boolean;
}

/** Vaha-styled panel (legacy name kept for staff dashboard imports). */
export function GlassCard({ children, className = '', hover = false }: GlassCardProps) {
  return (
    <div
      className={`border border-white/10 bg-vaha-ink-soft p-4 md:p-5 ${hover ? 'transition-colors hover:border-vaha-gold/40' : ''} ${className}`}
    >
      {children}
    </div>
  );
}

interface GlassButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline';
}

export function GlassButton({ children, variant = 'primary', className = '', ...props }: GlassButtonProps) {
  const variants = {
    primary: 'border-vaha-gold bg-vaha-gold text-vaha-ink hover:bg-white hover:border-white',
    secondary: 'border-white/15 bg-vaha-ink text-vaha-cream hover:border-vaha-gold/50',
    outline: 'border-vaha-gold/60 bg-transparent text-vaha-gold hover:bg-vaha-gold hover:text-vaha-ink',
  };

  return (
    <button
      className={`inline-flex min-h-10 items-center justify-center gap-2 border px-5 py-2 text-xs font-semibold uppercase tracking-[0.2em] transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${variants[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
