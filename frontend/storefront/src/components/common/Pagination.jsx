export default function Pagination({ page, totalPages, onChange }) {
  if (totalPages <= 1) return null;

  const pages = Array.from({ length: totalPages }, (_, i) => i + 1).filter(
    (p) => p === 1 || p === totalPages || Math.abs(p - page) <= 1
  );

  return (
    <nav className="mt-8 flex items-center justify-center gap-1" aria-label="Pagination">
      <button
        type="button"
        disabled={page <= 1}
        onClick={() => onChange(page - 1)}
        className="rounded-lg px-3 py-1.5 text-sm text-cream hover:bg-ink-600 disabled:opacity-30"
      >
        Prev
      </button>

      {pages.map((p, i) => (
        <span key={p} className="flex items-center">
          {i > 0 && pages[i - 1] !== p - 1 && <span className="px-1 text-ink-100">…</span>}
          <button
            type="button"
            onClick={() => onChange(p)}
            aria-current={p === page ? 'page' : undefined}
            className={`rounded-lg px-3 py-1.5 text-sm font-medium ${
              p === page ? 'bg-gold text-ink-900' : 'text-cream hover:bg-ink-600'
            }`}
          >
            {p}
          </button>
        </span>
      ))}

      <button
        type="button"
        disabled={page >= totalPages}
        onClick={() => onChange(page + 1)}
        className="rounded-lg px-3 py-1.5 text-sm text-cream hover:bg-ink-600 disabled:opacity-30"
      >
        Next
      </button>
    </nav>
  );
}
