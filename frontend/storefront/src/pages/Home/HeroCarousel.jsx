import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

const SLIDES = [
  {
    eyebrow: 'Nationwide delivery',
    headline: 'Order anywhere in Ghana.',
    body: 'Pay on delivery in Kumasi, or pay by card and Mobile Money everywhere else.',
    cta: { label: 'Shop all products', to: '/products' },
  },
  {
    eyebrow: 'This week',
    headline: 'Up to 25% off electronics.',
    body: 'Phones, fans, and audio — while stock lasts.',
    cta: { label: 'Shop electronics', to: '/products?category=electronics' },
  },
  {
    eyebrow: 'Kumasi customers',
    headline: 'Pay when it arrives.',
    body: 'Pay-on-delivery is available for every Kumasi address, checked automatically at checkout.',
    cta: { label: 'See delivery zones', to: '/products' },
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

  return (
    <section className="bg-ink text-paper">
      <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <p className="font-tag text-xs uppercase tracking-wide text-gold">
          {slide.eyebrow}
        </p>
        <h1 className="mt-3 max-w-xl font-display text-4xl font-800 leading-tight sm:text-5xl">
          {slide.headline}
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
              key={s.headline}
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
    </section>
  );
}
