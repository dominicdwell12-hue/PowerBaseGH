import { useState, useEffect } from 'react';

export default function FilterSidebar({ categories, filters, onChange }) {
  const [minPrice, setMinPrice] = useState(filters.minPrice ?? '');
  const [maxPrice, setMaxPrice] = useState(filters.maxPrice ?? '');

  useEffect(() => {
    setMinPrice(filters.minPrice ?? '');
    setMaxPrice(filters.maxPrice ?? '');
  }, [filters.minPrice, filters.maxPrice]);

  function applyPriceRange(e) {
    e.preventDefault();
    onChange({ minPrice: minPrice || undefined, maxPrice: maxPrice || undefined });
  }

  return (
    <aside className="w-full shrink-0 space-y-6 lg:w-56">
      <div>
        <h3 className="font-display text-sm font-700 text-ink-900">Category</h3>
        <ul className="mt-3 space-y-1">
          <li>
            <button
              type="button"
              onClick={() => onChange({ category: undefined })}
              className={`text-sm ${!filters.category ? 'font-semibold text-gold-700' : 'text-ash hover:text-ink-900'}`}
            >
              All categories
            </button>
          </li>
          {categories?.map((category) => (
            <li key={category.id}>
              <button
                type="button"
                onClick={() => onChange({ category: category.slug })}
                className={`text-sm ${
                  filters.category === category.slug
                    ? 'font-semibold text-gold-700'
                    : 'text-ash hover:text-ink-900'
                }`}
              >
                {category.name}
              </button>
            </li>
          ))}
        </ul>
      </div>

      <form onSubmit={applyPriceRange}>
        <h3 className="font-display text-sm font-700 text-ink-900">Price (GHS)</h3>
        <div className="mt-3 flex items-center gap-2">
          <input
            type="number"
            min="0"
            placeholder="Min"
            value={minPrice}
            onChange={(e) => setMinPrice(e.target.value)}
            className="w-full rounded-lg border border-ink-100 px-2 py-1.5 text-sm"
          />
          <span className="text-ash">–</span>
          <input
            type="number"
            min="0"
            placeholder="Max"
            value={maxPrice}
            onChange={(e) => setMaxPrice(e.target.value)}
            className="w-full rounded-lg border border-ink-100 px-2 py-1.5 text-sm"
          />
        </div>
        <button
          type="submit"
          className="mt-2 w-full rounded-lg bg-ink py-1.5 text-sm font-semibold text-paper hover:bg-ink-600"
        >
          Apply
        </button>
      </form>
    </aside>
  );
}
