export default function ErrorState({
  title = 'Something went wrong',
  message,
  onRetry,
}) {
  return (
    <div className="flex flex-col items-center gap-3 rounded-xl border border-brick/30 bg-brick/10 px-6 py-10 text-center">
      <p className="font-display text-lg font-700 text-cream">{title}</p>
      {message && <p className="max-w-sm text-sm text-ink-100">{message}</p>}
      {onRetry && (
        <button
          type="button"
          onClick={onRetry}
          className="mt-1 rounded-lg bg-gold px-4 py-2 text-sm font-semibold text-ink-900
            hover:bg-gold-700"
        >
          Try again
        </button>
      )}
    </div>
  );
}
