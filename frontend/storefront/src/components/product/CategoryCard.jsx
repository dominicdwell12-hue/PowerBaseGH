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
      className="group relative aspect-[4/3] overflow-hidden rounded-xl border border-ink-600 bg-ink-600"
    >
      <ImageWithFallback
        src={category.imageUrl ?? image.src}
        alt={image.alt}
        className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
        containerClassName="bg-ink-600"
        fallback={<Icon size={40} className="text-ink-100" aria-hidden="true" />}
      />
      <div className="absolute inset-0 bg-gradient-to-t from-ink-900/90 via-ink-900/10 to-transparent" />
      <div className="absolute inset-x-0 bottom-0 p-4">
        <p className="font-body text-sm font-semibold text-cream">{category.name}</p>
        <span className="mt-1 inline-flex items-center gap-1 text-xs font-medium text-gold">
          Explore now
          <ArrowRight size={12} className="transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
        </span>
      </div>
    </Link>
  );
}
