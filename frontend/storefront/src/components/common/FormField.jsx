export default function FormField({ label, error, children, htmlFor }) {
  return (
    <div className="flex flex-col gap-1">
      <label htmlFor={htmlFor} className="text-sm font-medium text-cream">
        {label}
      </label>
      {children}
      {error && <p className="text-xs text-brick-400">{error}</p>}
    </div>
  );
}

export const inputClass =
  'w-full rounded-lg border border-ink-600 px-3 py-2 text-sm text-cream ' +
  'placeholder:text-ink-100 focus:border-gold focus:outline-none';
