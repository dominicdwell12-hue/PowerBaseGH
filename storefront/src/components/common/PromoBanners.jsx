import { Link } from 'react-router-dom';
import { Headphones, Sparkle } from 'lucide-react';
import ImageWithFallback from './ImageWithFallback.jsx';
import { PROMO_IMAGES } from '../../utils/images.js';

export default function PromoBanners() {
  return (
    <div className="grid gap-6 sm:grid-cols-2">
      <div className="relative overflow-hidden rounded-2xl bg-ink text-paper">
        <div className="absolute inset-0">
          <ImageWithFallback
            src={PROMO_IMAGES.deals.src}
            alt={PROMO_IMAGES.deals.alt}
            className="h-full w-full object-cover opacity-40"
            fallback={<Headphones size={72} className="text-ink-600" aria-hidden="true" />}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-ink-900/95 via-ink-900/60 to-ink-900/20" />
        </div>

        <div className="relative p-6 sm:p-8">
          <span className="absolute right-0 top-0 flex h-12 w-12 items-center justify-center rounded-full bg-gold text-xs font-bold text-ink-900 sm:right-2 sm:top-2">
            30% off
          </span>
          <p className="text-xs uppercase tracking-wide text-ink-100">Best deals</p>
          <h3 className="mt-2 max-w-[14rem] font-display text-2xl font-800">
            Up to 30% off on selected items
          </h3>
          <Link
            to="/products"
            className="mt-5 inline-flex rounded-lg bg-gold px-4 py-2 text-sm font-semibold text-ink-900 hover:bg-gold-700"
          >
            Shop deals
          </Link>
        </div>
      </div>

      <div className="relative overflow-hidden rounded-2xl bg-gold-50">
        <div className="absolute inset-0">
          <ImageWithFallback
            src={PROMO_IMAGES.newArrivals.src}
            alt={PROMO_IMAGES.newArrivals.alt}
            className="h-full w-full object-cover opacity-30"
            fallback={<Sparkle size={72} className="text-gold-100" aria-hidden="true" />}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-gold-50 via-gold-50/70 to-gold-50/10" />
        </div>

        <div className="relative p-6 sm:p-8">
          <span className="absolute right-0 top-0 flex h-12 w-12 items-center justify-center rounded-full bg-ink text-xs font-bold text-paper sm:right-2 sm:top-2">
            New
          </span>
          <p className="text-xs uppercase tracking-wide text-gold-700">New arrivals</p>
          <h3 className="mt-2 max-w-[14rem] font-display text-2xl font-800 text-ink-900">
            Fresh products just for you
          </h3>
          <Link
            to="/products?sort=newest"
            className="mt-5 inline-flex rounded-lg border border-ink-900 px-4 py-2 text-sm font-semibold text-ink-900 hover:bg-ink hover:text-paper"
          >
            Shop new arrivals
          </Link>
        </div>
      </div>
    </div>
  );
}
