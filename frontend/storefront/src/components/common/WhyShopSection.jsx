import { Truck, ShieldCheck, Headset, BadgeCheck } from 'lucide-react';

const REASONS = [
  { icon: Truck, title: 'Fast & Free Shipping', subtitle: 'On qualifying orders' },
  { icon: ShieldCheck, title: 'Secure Payments', subtitle: 'Shop with confidence' },
  { icon: Headset, title: '24/7 Customer Support', subtitle: "We're here to help" },
  { icon: BadgeCheck, title: 'Premium Quality', subtitle: 'Built to last' },
];

export default function WhyShopSection() {
  return (
    <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="grid grid-cols-2 gap-6 sm:grid-cols-4">
        {REASONS.map(({ icon: Icon, title, subtitle }) => (
          <div key={title} className="flex flex-col items-center gap-2 text-center sm:flex-row sm:text-left">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-gold/10 text-gold">
              <Icon size={20} aria-hidden="true" />
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
