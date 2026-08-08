import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ShoppingBag, Zap, Truck } from 'lucide-react';
import ImageWithFallback from '../../components/common/ImageWithFallback.jsx';
import { HERO_IMAGE } from '../../utils/images.js';

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
    <section className="bg-ink text-paper">
      <div className="mx-auto grid max-w-7xl items-center gap-8 px-4 py-14 sm:px-6 lg:grid-cols-2 lg:px-8">
        <div>
          <p className="font-tag text-xs uppercase tracking-wide text-gold">{slide.eyebrow}</p>
          <h1 className="mt-3 max-w-xl font-display text-4xl font-800 leading-tight sm:text-5xl">
            {slide.headline} <span className="text-gold">{slide.highlight}</span> {slide.tail}
          </h1>
          <p className="mt-4 max-w-md text-ink-100">{slide.body}</p>
          <Link
            to={slide.cta.to}
            className="mt-6 inline-flex items-center rounded-lg bg-gold px-5 py-2.5
              font-body text-sm font-semibold text-ink-900 transition-colors hover:bg-gold-700"
          >
            {slide.cta.label}
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

        <div className="hidden aspect-square overflow-hidden rounded-2xl border border-ink-600 bg-ink-600 lg:block">
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
      </div>
    </section>
  );
}
