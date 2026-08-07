export default function Spinner({ label = 'Loading' }) {
  return (
    <div className="flex items-center justify-center gap-2 py-8 text-ash" role="status">
      <span
        className="h-5 w-5 animate-spin rounded-full border-2 border-ink-100 border-t-gold"
        aria-hidden="true"
      />
      <span className="text-sm">{label}</span>
    </div>
  );
}
