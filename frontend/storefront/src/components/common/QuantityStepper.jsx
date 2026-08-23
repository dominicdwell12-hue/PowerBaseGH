export default function QuantityStepper({ value, onChange, min = 1, max = 99, disabled = false }) {
  function clamp(next) {
    return Math.min(max, Math.max(min, next));
  }

  return (
    <div className="inline-flex items-center rounded-lg border border-ink-600">
      <button
        type="button"
        disabled={disabled || value <= min}
        onClick={() => onChange(clamp(value - 1))}
        aria-label="Decrease quantity"
        className="px-3 py-1.5 text-cream disabled:opacity-30"
      >
        −
      </button>
      <span className="w-8 text-center font-tag text-sm" aria-live="polite">
        {value}
      </span>
      <button
        type="button"
        disabled={disabled || value >= max}
        onClick={() => onChange(clamp(value + 1))}
        aria-label="Increase quantity"
        className="px-3 py-1.5 text-cream disabled:opacity-30"
      >
        +
      </button>
    </div>
  );
}
