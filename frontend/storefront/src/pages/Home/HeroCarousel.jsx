import { Link } from 'react-router-dom';
import { ArrowRight, Truck } from 'lucide-react';

/**
 * A single strong hero, restyled to the reference's premium dark/gold
 * lighting-showroom look. When a real featured product photo is available
 * (`heroImage`, passed in from Home.jsx's own featuredProducts query) it's
 * used as a dim, overlaid backdrop — never a stock or AI-generated image.
 * With no featured products yet, it falls back to the original hand-drawn
 * pendant illustration so the hero never depends on fake imagery.
 *
 * `categoryCount` comes from Home.jsx's real categoriesQuery — this line
 * is computed from the live API response, never a hardcoded number.
 */
export default function HeroCarousel({ categoryCount, heroImage }) {
  return (
    <section className="relative overflow-hidden bg-ink-900 text-cream">
      {heroImage ? (
        <>
          <img
            src={heroImage}
            alt=""
            aria-hidden="true"
            className="absolute inset-0 h-full w-full object-cover opacity-30"
          />
          <div
            className="absolute inset-0 bg-gradient-to-r from-ink-900 via-ink-900/95 to-ink-900/60"
            aria-hidden="true"
          />
        </>
      ) : (
        <div
          className="pointer-events-none absolute -top-24 right-0 h-[32rem] w-[32rem] rounded-full bg-gold/10 blur-3xl"
          aria-hidden="true"
        />
      )}

      <div className="relative mx-auto grid max-w-7xl items-center gap-10 px-4 py-16 sm:px-6 lg:grid-cols-2 lg:py-24 lg:px-8">
        <div>
          <p className="inline-flex items-center gap-2 font-tag text-xs uppercase tracking-widest text-gold">
            <span className="h-px w-6 bg-gold" aria-hidden="true" />
            {categoryCount > 0 ? `${categoryCount} ways to shop PowerBase` : 'PowerBase Gh'}
          </p>
          <h1 className="mt-4 max-w-xl font-display text-4xl font-800 leading-[1.08] sm:text-5xl lg:text-6xl">
            Premium picks for{' '}
            <em className="font-serifAccent italic font-500 text-gold">every space.</em>
          </h1>
          <p className="mt-5 max-w-md text-ink-100">
            Beautiful. Durable. Affordable. Real products at real cedi prices, delivered to your
            door across Ghana — pay on delivery in Kumasi, or by card and Mobile Money anywhere
            else.
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-4">
            <Link
              to="/products"
              className="inline-flex items-center gap-2 rounded-lg bg-gold px-6 py-3
                font-body text-sm font-semibold uppercase tracking-wide text-ink-900
                transition-colors hover:bg-gold-700"
            >
              Shop Now
              <ArrowRight size={16} aria-hidden="true" />
            </Link>
            <a
              href="#categories"
              className="inline-flex items-center gap-2 rounded-lg border border-ink-600 px-6 py-3
                font-body text-sm font-semibold uppercase tracking-wide text-cream
                transition-colors hover:border-gold hover:text-gold"
            >
              Explore Categories
            </a>
          </div>
          <span className="mt-6 inline-flex items-center gap-2 text-sm text-ink-100">
            <Truck size={16} className="text-gold" aria-hidden="true" />
            Nationwide delivery across Ghana
          </span>
        </div>

        {/* Decorative brand illustration — a drawn pendant light, not a
            photo of any real product. Only shown when there's no real
            product photo to anchor the hero with. Lights up once on
            load; respects prefers-reduced-motion. */}
        {!heroImage && (
          <div className="relative hidden items-start justify-center lg:flex" aria-hidden="true">
            <svg viewBox="0 0 220 300" width="100%" height="300" style={{ maxWidth: 320 }}>
              <g className="hero-pendant-swing">
                <line x1="110" y1="0" x2="110" y2="120" stroke="#4A5978" strokeWidth="2" />
                <path
                  d="M65 120 L155 120 L182 205 Q110 228 38 205 Z"
                  fill="#232F4B"
                  stroke="#4A5978"
                  strokeWidth="1.4"
                  className="hero-pendant-shade"
                />
                <circle cx="110" cy="166" r="11" className="hero-pendant-bulb" />
              </g>
            </svg>
          </div>
        )}
      </div>
    </section>
  );
}
