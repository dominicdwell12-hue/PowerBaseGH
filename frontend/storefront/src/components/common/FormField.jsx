export default function FormField({ label, error, children, htmlFor }) {
  return (
    <div className="flex flex-col gap-1">
      <label htmlFor={htmlFor} className="text-sm font-medium text-ink-900">
        {label}
      </label>
      {children}
      {error && <p className="text-xs text-brick-600">{error}</p>}
    </div>
  );
}

export const inputClass =
  'w-full rounded-lg border border-ink-100 px-3 py-2 text-sm text-ink-900 ' +
  'placeholder:text-ash focus:border-gold focus:outline-none';
