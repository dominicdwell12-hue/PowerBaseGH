import { Link } from 'react-router-dom';
import { Headphones, Sparkle } from 'lucide-react';
import ImageWithFallback from './ImageWithFallback.jsx';
import { PROMO_IMAGES } from '../../utils/images.js';

export default function PromoBanners() {
  return (
    <div className="grid gap-6 sm:grid-cols-2">
      <div className="relative overflow-hidden rounded-2xl bg-ink p-6 text-paper sm:p-8">
        <span className="absolute right-5 top-5 flex h-12 w-12 items-center justify-center rounded-full bg-gold text-xs font-bold text-ink-900">
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
        <div className="pointer-events-none absolute -bottom-2 right-4 h-28 w-28 sm:h-36 sm:w-36">
          <ImageWithFallback
            src={PROMO_IMAGES.deals.src}
            alt={PROMO_IMAGES.deals.alt}
            className="h-full w-full object-contain drop-shadow-xl"
            containerClassName="bg-transparent"
            fallback={<Headphones size={72} className="text-ink-600" aria-hidden="true" />}
          />
        </div>
      </div>

      <div className="relative overflow-hidden rounded-2xl bg-gold-50 p-6 sm:p-8">
        <span className="absolute right-5 top-5 flex h-12 w-12 items-center justify-center rounded-full bg-ink text-xs font-bold text-paper">
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
        <div className="pointer-events-none absolute -bottom-2 right-4 h-28 w-28 sm:h-36 sm:w-36">
          <ImageWithFallback
            src={PROMO_IMAGES.newArrivals.src}
            alt={PROMO_IMAGES.newArrivals.alt}
            className="h-full w-full object-contain drop-shadow-xl"
            containerClassName="bg-transparent"
            fallback={<Sparkle size={72} className="text-gold-100" aria-hidden="true" />}
          />
        </div>
      </div>
    </div>
  );
}
