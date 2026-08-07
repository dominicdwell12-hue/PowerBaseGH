import { Link } from 'react-router-dom';
import {
  Smartphone,
  Shirt,
  Sparkles,
  Sofa,
  Refrigerator,
  Package,
  ArrowRight,
} from 'lucide-react';

// No real category photography exists yet (Cloudinary isn't configured
// and there's no real inventory) — this picks a representative icon by
// keyword so the grid isn't just blank boxes until real images replace
// these placeholders.
function pickIcon(name = '') {
  const n = name.toLowerCase();
  if (n.includes('phone') || n.includes('electronic') || n.includes('tablet')) return Smartphone;
  if (n.includes('fashion') || n.includes('cloth') || n.includes('wear')) return Shirt;
  if (n.includes('beauty') || n.includes('health')) return Sparkles;
  if (n.includes('home') || n.includes('living') || n.includes('furniture')) return Sofa;
  if (n.includes('appliance') || n.includes('kitchen')) return Refrigerator;
  return Package;
}

export default function CategoryCard({ category }) {
  const Icon = pickIcon(category.name);

  return (
    <Link
      to={`/products?category=${category.slug}`}
      className="group overflow-hidden rounded-xl border border-ink-50 bg-white transition-shadow hover:shadow-md"
    >
      <div className="flex aspect-[4/3] items-center justify-center bg-ink-50">
        <Icon size={40} className="text-ink-400" aria-hidden="true" />
      </div>
      <div className="p-4">
        <p className="font-body text-sm font-semibold text-ink-900">{category.name}</p>
        <span className="mt-1 inline-flex items-center gap-1 text-xs font-medium text-gold-700">
          Explore now
          <ArrowRight size={12} className="transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
        </span>
      </div>
    </Link>
  );
}
