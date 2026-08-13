import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ShoppingBag, Zap, Truck, ArrowRight } from 'lucide-react';
import ImageWithFallback from '../../components/common/ImageWithFallback.jsx';
import { HERO_IMAGE, HERO_ACCENT_IMAGE } from '../../utils/images.js';

const SLIDES = [
  {
    eyebrow: 'Nationwide delivery',
    headline: 'Everything you need, delivered',
    highlight: 'anywhere',
    tail: 'in Ghana.',
    body: 'Shop quality products across all categories. Pay on delivery in Kumasi, or pay by card and Mobile Money everywhere else.',
    cta: { label: 'Shop all products', to: '/products' },
    icon: ShoppingBag,
  },
  {
    eyebrow: 'This week',
    headline: 'Up to',
    highlight: '25% off',
    tail: 'electronics.',
    body: 'Phones, fans, and audio — while stock lasts.',
    cta: { label: 'Shop electronics', to: '/products' },
    icon: Zap,
  },
  {
    eyebrow: 'Kumasi customers',
    headline: 'Pay',
    highlight: 'when it arrives',
    tail: '.',
    body: 'Pay-on-delivery is available for every Kumasi address, checked automatically at checkout.',
    cta: { label: 'Shop all products', to: '/products' },
    icon: Truck,
  },
];

export default function HeroCarousel() {
  const [active, setActive] = useState(0);

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) return undefined;

    const timer = setInterval(() => {
      setActive((current) => (current + 1) % SLIDES.length);
    }, 6000);
    return () => clearInterval(timer);
  }, []);

  const slide = SLIDES[active];
  const Icon = slide.icon;

  return (
    <section className="relative overflow-hidden bg-ink-900 text-cream">
      {/* Faint radial gold glow behind the whole hero for a premium, lit-from-within feel */}
      <div
        className="pointer-events-none absolute -top-24 right-0 h-[32rem] w-[32rem] rounded-full bg-gold/10 blur-3xl"
        aria-hidden="true"
      />
      <div className="relative mx-auto grid max-w-7xl items-center gap-10 px-4 py-16 sm:px-6 lg:grid-cols-2 lg:py-24 lg:px-8">
        <div>
          <p className="inline-flex items-center gap-2 font-tag text-xs uppercase tracking-widest text-gold">
            <Icon size={14} aria-hidden="true" />
            {slide.eyebrow}
          </p>
          <h1 className="mt-4 max-w-xl font-display text-4xl font-800 leading-[1.1] sm:text-5xl lg:text-6xl">
            {slide.headline} <em className="text-gold not-italic">{slide.highlight}</em> {slide.tail}
          </h1>
          <p className="mt-5 max-w-md text-ink-100">{slide.body}</p>
          <Link
            to={slide.cta.to}
            className="mt-8 inline-flex items-center gap-2 rounded-lg bg-gold px-6 py-3
              font-body text-sm font-semibold uppercase tracking-wide text-ink-900
              transition-colors hover:bg-gold-700"
          >
            {slide.cta.label}
            <ArrowRight size={16} aria-hidden="true" />
          </Link>

          <div className="mt-10 flex gap-2" role="tablist" aria-label="Featured promotions">
            {SLIDES.map((s, index) => (
              <button
                key={s.headline + s.highlight}
                type="button"
                role="tab"
                aria-selected={index === active}
                aria-label={`Show promotion ${index + 1}`}
                onClick={() => setActive(index)}
                className={`h-1.5 rounded-full transition-all ${
                  index === active ? 'w-8 bg-gold' : 'w-4 bg-ink-400'
                }`}
              />
            ))}
          </div>
        </div>

        <div className="relative hidden lg:block">
          <div
            className="aspect-square overflow-hidden rounded-2xl border border-gold/20 bg-ink-600
              shadow-[0_0_60px_-15px_rgba(201,138,44,0.35)]"
          >
            <ImageWithFallback
              src={HERO_IMAGE.src}
              alt={HERO_IMAGE.alt}
              loading="eager"
              fetchPriority="high"
              className="h-full w-full object-cover"
              containerClassName="bg-ink-600"
              fallback={<Icon size={96} className="text-gold" aria-hidden="true" />}
            />
          </div>

          {/* Small floating accent card — purely decorative; degrades to a
              plain gold dot rather than a broken-image icon if it fails */}
          <div
            className="absolute -bottom-6 -left-8 hidden h-32 w-32 overflow-hidden rounded-xl
              border border-gold/30 bg-ink-600 shadow-xl xl:block"
          >
            <ImageWithFallback
              src={HERO_ACCENT_IMAGE.src}
              alt={HERO_ACCENT_IMAGE.alt}
              className="h-full w-full object-cover"
              containerClassName="bg-ink-600"
              fallback={<span className="h-3 w-3 rounded-full bg-gold" aria-hidden="true" />}
            />
          </div>
        </div>
      </div>
    </section>
  );
}
