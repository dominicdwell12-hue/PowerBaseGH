import { Truck } from 'lucide-react';

export default function TopBar() {
  return (
    <div className="bg-ink-900 px-4 py-1.5 text-xs text-ink-100 sm:px-6 lg:px-8">
      <div className="mx-auto flex max-w-7xl items-center justify-between">
        <span className="flex items-center gap-1.5">
          <Truck size={14} aria-hidden="true" />
          Nationwide delivery across Ghana
        </span>
        <span className="hidden sm:inline">
          <span className="text-gold">Pay on delivery in Kumasi</span>
          <span className="mx-2 text-ink-400">|</span>
          Card &amp; Mobile Money everywhere
        </span>
      </div>
    </div>
  );
}
