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
import ImageWithFallback from '../common/ImageWithFallback.jsx';
import { getCategoryImage } from '../../utils/images.js';

// Used as the graceful fallback if a category's photo fails to load —
// picks a representative icon by keyword so the tile still reads clearly.
function pickIcon(name = '') {
  const n = name.toLowerCase();
  if (n.includes('appliance') || n.includes('kitchen')) return Refrigerator;
  if (n.includes('phone') || n.includes('tablet') || n.includes('electronic')) return Smartphone;
  if (n.includes('fashion') || n.includes('cloth') || n.includes('wear')) return Shirt;
  if (n.includes('beauty') || n.includes('health')) return Sparkles;
  if (n.includes('home') || n.includes('living') || n.includes('furniture')) return Sofa;
  return Package;
}

export default function CategoryCard({ category }) {
  const Icon = pickIcon(category.name);
  const image = getCategoryImage(category.name);

  return (
    <Link
      to={`/products?category=${category.slug}`}
      className="group overflow-hidden rounded-xl border border-ink-50 bg-white transition-shadow hover:shadow-md"
    >
      <div className="aspect-[4/3] overflow-hidden bg-ink-50">
        <ImageWithFallback
          src={category.imageUrl ?? image.src}
          alt={image.alt}
          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
          fallback={<Icon size={40} className="text-ink-400" aria-hidden="true" />}
        />
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
