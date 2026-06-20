import React from 'react';

interface GlassCardProps {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
}

export function GlassCard({ children, className = '', hover = false }: GlassCardProps) {
  return (
    <div className={`
      relative overflow-hidden rounded-2xl border border-white/10 bg-white/5 backdrop-blur-md 
      shadow-[0_8px_32px_0_rgba(0,0,0,0.3)]
      ${hover ? 'hover:bg-white/10 hover:border-white/20 transition-all duration-300 group' : ''}
      ${className}
    `}>
      {/* Decorative gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent pointer-events-none" />
      <div className="relative z-10">{children}</div>
    </div>
  );
}

interface GlassButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline';
}

export function GlassButton({ children, variant = 'primary', className = '', ...props }: GlassButtonProps) {
  const variants = {
    primary: 'bg-luxury-accent text-black hover:bg-yellow-400 shadow-[0_0_20px_rgba(212,175,55,0.3)]',
    secondary: 'bg-white/10 text-white hover:bg-white/20 border border-white/10',
    outline: 'bg-transparent text-luxury-accent border border-luxury-accent/50 hover:border-luxury-accent hover:bg-luxury-accent/5',
  };

  return (
    <button 
      className={`
        px-6 py-3 rounded-full font-bold transition-all duration-300 flex items-center justify-center gap-2
        disabled:opacity-50 disabled:cursor-not-allowed
        ${variants[variant]}
        ${className}
      `}
      {...props}
    >
      {children}
    </button>
  );
}
