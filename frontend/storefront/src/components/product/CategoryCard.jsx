import { Link } from 'react-router-dom';
import { Package, ArrowRight } from 'lucide-react';
import ImageWithFallback from '../common/ImageWithFallback.jsx';
import CategoryIcon, { isLightingCategory } from './CategoryIcon.jsx';
import { getCategoryImage } from '../../utils/images.js';

export default function CategoryCard({ category }) {
  const image = getCategoryImage(category.name);
  const lighting = isLightingCategory(category.name);

  // Lighting categories (the actual catalog) get their own hand-drawn,
  // hover-lit icon; anything else still falls back to a plain Package icon
  // rather than guessing a lucide icon that may not exist for it.
  const fallback = lighting ? (
    <CategoryIcon name={category.name} className="h-11 w-11 text-ink-100" />
  ) : (
    <Package size={40} className="text-ink-100" aria-hidden="true" />
  );

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
        fallback={fallback}
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
