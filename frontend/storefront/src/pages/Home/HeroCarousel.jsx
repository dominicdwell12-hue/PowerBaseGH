import { Link } from 'react-router-dom';
import { ArrowRight, Truck } from 'lucide-react';

/**
 * A single strong hero, not a slide carousel — matches the "Light,
 * considered." reference direction, restyled entirely in PowerBase's own
 * ink/gold tokens (no new palette). The pendant is hand-drawn SVG brand
 * illustration, not a product photo or stock image — nothing here claims
 * to depict a real, purchasable fixture, and the copy below is intentionally
 * generic ("the products PowerBase carries") rather than naming a specific
 * category, since PowerBase isn't lighting-only.
 *
 * `categoryCount` comes from Home.jsx's real categoriesQuery — this line
 * is computed from the live API response, never a hardcoded number.
 */
export default function HeroCarousel({ categoryCount }) {
  return (
    <section className="relative overflow-hidden bg-ink-900 text-cream">
      <div
        className="pointer-events-none absolute -top-24 right-0 h-[32rem] w-[32rem] rounded-full bg-gold/10 blur-3xl"
        aria-hidden="true"
      />
      <div className="relative mx-auto grid max-w-7xl items-center gap-10 px-4 py-16 sm:px-6 lg:grid-cols-2 lg:py-24 lg:px-8">
        <div>
          <p className="inline-flex items-center gap-2 font-tag text-xs uppercase tracking-widest text-gold">
            <span className="h-px w-6 bg-gold" aria-hidden="true" />
            {categoryCount > 0 ? `${categoryCount} ways to shop PowerBase` : 'PowerBase Gh'}
          </p>
          <h1 className="mt-4 max-w-xl font-display text-4xl font-800 leading-[1.08] sm:text-5xl lg:text-6xl">
            Quality, <em className="font-serifAccent italic font-500 text-gold">delivered.</em>
          </h1>
          <p className="mt-5 max-w-md text-ink-100">
            Real products, real prices in cedis, browsable by what you're actually shopping
            for — not a generic aisle. Pay on delivery in Kumasi, or pay by card and Mobile
            Money anywhere else in Ghana.
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-4">
            <Link
              to="/products"
              className="inline-flex items-center gap-2 rounded-lg bg-gold px-6 py-3
                font-body text-sm font-semibold uppercase tracking-wide text-ink-900
                transition-colors hover:bg-gold-700"
            >
              Shop all products
              <ArrowRight size={16} aria-hidden="true" />
            </Link>
            <span className="inline-flex items-center gap-2 text-sm text-ink-100">
              <Truck size={16} className="text-gold" aria-hidden="true" />
              Nationwide delivery across Ghana
            </span>
          </div>
        </div>

        {/* Decorative brand illustration — a drawn pendant light, not a
            photo of any real product. Lights up once on load; respects
            prefers-reduced-motion. */}
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
      </div>
    </section>
  );
}
