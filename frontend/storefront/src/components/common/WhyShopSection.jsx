import { Truck, ShieldCheck, BadgeCheck } from 'lucide-react';

// The reference design's compact 3-card benefits strip, placed right
// under the hero. Purely presentational/static copy about how the store
// operates (delivery, payments, quality) — not product data, so nothing
// here needs to come from the API.
const REASONS = [
  { icon: Truck, title: 'Fast Delivery', subtitle: 'Across Ghana' },
  { icon: ShieldCheck, title: 'Secure Payments', subtitle: '100% Protected' },
  { icon: BadgeCheck, title: 'Quality Guarantee', subtitle: 'Best Brands Only' },
];

export default function WhyShopSection() {
  return (
    <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
      <div className="grid grid-cols-1 divide-y divide-ink-600 rounded-xl border border-ink-600 bg-ink-600/40 sm:grid-cols-3 sm:divide-x sm:divide-y-0">
        {REASONS.map(({ icon: Icon, title, subtitle }) => (
          <div key={title} className="flex items-center gap-3 px-5 py-4">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gold/10 text-gold">
              <Icon size={19} aria-hidden="true" />
            </span>
            <div>
              <p className="text-sm font-semibold text-cream">{title}</p>
              <p className="mt-0.5 text-xs text-ink-100">{subtitle}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
