import { Truck, ShieldCheck, BadgeCheck, Headset } from 'lucide-react';

const FEATURES = [
  { icon: Truck, title: 'Nationwide Delivery', subtitle: 'Fast & reliable delivery across Ghana' },
  { icon: ShieldCheck, title: 'Secure Payments', subtitle: 'Pay safely with card or Mobile Money' },
  { icon: BadgeCheck, title: 'Quality Guarantee', subtitle: 'We ensure quality in every order' },
  { icon: Headset, title: '24/7 Support', subtitle: "We're here to help you always" },
];

export default function FeatureIconRow() {
  return (
    <div className="mx-auto -mt-8 max-w-6xl px-4 sm:px-6 lg:px-8">
      <div className="grid grid-cols-2 gap-6 rounded-2xl bg-ink-600 p-6 shadow-lg sm:grid-cols-4 sm:p-8">
        {FEATURES.map(({ icon: Icon, title, subtitle }) => (
          <div key={title} className="flex flex-col items-center text-center">
            <span className="flex h-14 w-14 items-center justify-center rounded-full bg-ink-400/20 text-ink-900">
              <Icon size={26} aria-hidden="true" />
            </span>
            <p className="mt-3 font-body text-sm font-semibold text-ink-900">{title}</p>
            <p className="mt-1 text-xs text-ink-100">{subtitle}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
