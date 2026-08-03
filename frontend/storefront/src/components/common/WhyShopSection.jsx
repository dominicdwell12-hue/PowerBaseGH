import { LayoutGrid, ShieldCheck, RotateCcw, Users } from 'lucide-react';

const REASONS = [
  { icon: LayoutGrid, title: 'Wide range', subtitle: 'Thousands of products in multiple categories' },
  { icon: ShieldCheck, title: 'Great prices', subtitle: 'Competitive prices you can trust' },
  { icon: RotateCcw, title: 'Easy returns', subtitle: 'Hassle-free returns within 7 days' },
  { icon: Users, title: 'Trusted by many', subtitle: 'Join thousands of happy customers' },
];

export default function WhyShopSection() {
  return (
    <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <h2 className="font-display text-2xl font-700 text-ink-900">Why shop with PowerBase.Gh?</h2>
      <div className="mt-6 grid grid-cols-2 gap-6 sm:grid-cols-4">
        {REASONS.map(({ icon: Icon, title, subtitle }) => (
          <div key={title} className="flex items-start gap-3">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-ink-50 text-ink-900">
              <Icon size={18} aria-hidden="true" />
            </span>
            <div>
              <p className="text-sm font-semibold text-ink-900">{title}</p>
              <p className="mt-0.5 text-xs text-ash">{subtitle}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
