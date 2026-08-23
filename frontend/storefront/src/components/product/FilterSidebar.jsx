import { useState, useEffect } from 'react';
import { X } from 'lucide-react';

/**
 * Category + price filters. Rendered inline as a sidebar on desktop
 * (lg:block, always visible) and as a slide-over panel on mobile,
 * toggled by ProductListing's "Filter" button via `open`/`onClose`.
 */
export default function FilterSidebar({ categories, filters, onChange, open, onClose }) {
  const [minPrice, setMinPrice] = useState(filters.minPrice ?? '');
  const [maxPrice, setMaxPrice] = useState(filters.maxPrice ?? '');

  useEffect(() => {
    setMinPrice(filters.minPrice ?? '');
    setMaxPrice(filters.maxPrice ?? '');
  }, [filters.minPrice, filters.maxPrice]);

  function applyPriceRange(e) {
    e.preventDefault();
    onChange({ minPrice: minPrice || undefined, maxPrice: maxPrice || undefined });
    onClose?.();
  }

  const body = (
    <div className="space-y-6">
      <div>
        <h3 className="font-display text-sm font-700 text-cream">Category</h3>
        <ul className="mt-3 space-y-1.5">
          <li>
            <button
              type="button"
              onClick={() => {
                onChange({ category: undefined });
                onClose?.();
              }}
              className={`text-sm ${!filters.category ? 'font-semibold text-gold' : 'text-ink-100 hover:text-cream'}`}
            >
              All categories
            </button>
          </li>
          {categories?.map((category) => (
            <li key={category.id}>
              <button
                type="button"
                onClick={() => {
                  onChange({ category: category.slug });
                  onClose?.();
                }}
                className={`text-sm ${
                  filters.category === category.slug
                    ? 'font-semibold text-gold'
                    : 'text-ink-100 hover:text-cream'
                }`}
              >
                {category.name}
              </button>
            </li>
          ))}
        </ul>
      </div>

      <form onSubmit={applyPriceRange}>
        <h3 className="font-display text-sm font-700 text-cream">Price (GHS)</h3>
        <div className="mt-3 flex items-center gap-2">
          <input
            type="number"
            min="0"
            placeholder="Min"
            value={minPrice}
            onChange={(e) => setMinPrice(e.target.value)}
            className="w-full rounded-lg border border-ink-600 bg-ink-600 px-2 py-1.5 text-sm text-cream
              placeholder:text-ink-100 focus:outline-none focus:ring-2 focus:ring-gold"
          />
          <span className="text-ink-100">–</span>
          <input
            type="number"
            min="0"
            placeholder="Max"
            value={maxPrice}
            onChange={(e) => setMaxPrice(e.target.value)}
            className="w-full rounded-lg border border-ink-600 bg-ink-600 px-2 py-1.5 text-sm text-cream
              placeholder:text-ink-100 focus:outline-none focus:ring-2 focus:ring-gold"
          />
        </div>
        <button
          type="submit"
          className="mt-2 w-full rounded-lg bg-gold py-1.5 text-sm font-semibold text-ink-900 hover:bg-gold-700"
        >
          Apply
        </button>
      </form>
    </div>
  );

  return (
    <>
      {/* Desktop: always-visible sidebar */}
      <aside className="hidden w-56 shrink-0 lg:block">{body}</aside>

      {/* Mobile/tablet: slide-over panel, toggled by the "Filter" button */}
      {open && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            type="button"
            aria-label="Close filters"
            onClick={onClose}
            className="absolute inset-0 bg-ink-900/70"
          />
          <div className="absolute inset-y-0 left-0 flex w-80 max-w-[85vw] flex-col overflow-y-auto border-r border-ink-600 bg-ink-900 p-5">
            <div className="mb-5 flex items-center justify-between">
              <h2 className="font-display text-lg font-700 text-cream">Filters</h2>
              <button
                type="button"
                onClick={onClose}
                aria-label="Close filters"
                className="flex h-8 w-8 items-center justify-center rounded-full text-ink-100 hover:bg-ink-600 hover:text-cream"
              >
                <X size={18} aria-hidden="true" />
              </button>
            </div>
            {body}
          </div>
        </div>
      )}
    </>
  );
}
