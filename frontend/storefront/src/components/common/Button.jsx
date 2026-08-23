const VARIANTS = {
  primary: 'bg-gold text-ink-900 hover:bg-gold-700 focus-visible:bg-gold-700',
  secondary: 'bg-ink-600 text-cream hover:bg-ink-400',
  outline: 'border border-ink-600 text-cream hover:bg-ink-600',
  danger: 'bg-brick text-paper hover:bg-brick-400',
};

export default function Button({
  as: Component = 'button',
  variant = 'primary',
  className = '',
  children,
  ...props
}) {
  return (
    <Component
      className={`inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2
        font-body text-sm font-semibold transition-colors disabled:cursor-not-allowed
        disabled:opacity-50 ${VARIANTS[variant]} ${className}`}
      {...props}
    >
      {children}
    </Component>
  );
}
