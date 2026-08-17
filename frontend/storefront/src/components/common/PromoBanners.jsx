import { Link } from 'react-router-dom';
import { Tag, Sparkle } from 'lucide-react';

/**
 * Two promo banners. Previously hardcoded "Up to 30% off" with a stock
 * Unsplash photo — a fake claim with no real promotion behind it. Now:
 * the deals banner only renders when a real max discount is passed in
 * (computed by Home.jsx from actual product.discountPrice data), and
 * neither banner uses a stock photo — just an icon, like PriceTag's own
 * convention elsewhere in the app.
 */
export default function PromoBanners({ maxDiscountPercent }) {
  return (
    <div className="grid gap-6 sm:grid-cols-2">
      {maxDiscountPercent > 0 && (
        <div className="relative overflow-hidden rounded-2xl border border-ink-600 bg-ink-600 p-6 text-cream sm:p-8">
          <span className="absolute right-5 top-5 flex h-12 w-12 items-center justify-center rounded-full bg-magenta text-xs font-bold text-cream">
            {maxDiscountPercent}% off
          </span>
          <p className="text-xs uppercase tracking-wide text-ink-100">Best deals</p>
          <h3 className="mt-2 max-w-[14rem] font-display text-2xl font-800">
            Up to {maxDiscountPercent}% off on selected items
          </h3>
          <Link
            to="/products"
            className="mt-5 inline-flex rounded-lg bg-gold px-4 py-2 text-sm font-semibold text-ink-900 hover:bg-gold-700"
          >
            Shop deals
          </Link>
          <Tag
            size={88}
            className="pointer-events-none absolute -bottom-4 right-4 text-ink-400/40"
            aria-hidden="true"
          />
        </div>
      )}

      <div
        className={`relative overflow-hidden rounded-2xl border border-gold/20 bg-ink-600 p-6 sm:p-8 ${
          maxDiscountPercent > 0 ? '' : 'sm:col-span-2'
        }`}
      >
        <span className="absolute right-5 top-5 flex h-12 w-12 items-center justify-center rounded-full bg-gold text-xs font-bold text-ink-900">
          New
        </span>
        <p className="text-xs uppercase tracking-wide text-gold">New arrivals</p>
        <h3 className="mt-2 max-w-[14rem] font-display text-2xl font-800 text-cream">
          Fresh products just for you
        </h3>
        <Link
          to="/products?sort=newest"
          className="mt-5 inline-flex rounded-lg border border-gold px-4 py-2 text-sm font-semibold text-gold hover:bg-gold hover:text-ink-900"
        >
          Shop new arrivals
        </Link>
        <Sparkle
          size={88}
          className="pointer-events-none absolute -bottom-4 right-4 text-gold/25"
          aria-hidden="true"
        />
      </div>
    </div>
  );
}
