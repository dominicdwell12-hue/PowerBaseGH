export default function ErrorState({
  title = 'Something went wrong',
  message,
  onRetry,
}) {
  return (
    <div className="flex flex-col items-center gap-3 rounded-xl border border-brick-50 bg-brick-50/40 px-6 py-10 text-center">
      <p className="font-display text-lg font-700 text-ink-900">{title}</p>
      {message && <p className="max-w-sm text-sm text-ash">{message}</p>}
      {onRetry && (
        <button
          type="button"
          onClick={onRetry}
          className="mt-1 rounded-lg bg-ink px-4 py-2 text-sm font-semibold text-paper
            hover:bg-ink-600"
        >
          Try again
        </button>
      )}
    </div>
  );
}
