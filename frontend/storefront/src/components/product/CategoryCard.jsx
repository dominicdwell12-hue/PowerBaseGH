import { Link } from 'react-router-dom';
import { Package, ArrowRight } from 'lucide-react';
import ImageWithFallback from '../common/ImageWithFallback.jsx';
import CategoryIcon, { isLightingCategory } from './CategoryIcon.jsx';
import { getCategoryBlurb } from '../../data/lightingCategories.js';

/**
 * Editorial-style category tile: numbered index, icon (or the category's
 * real photo, if the admin has uploaded one), name, one-line description,
 * and a "SHOP X" link. `index` is just this card's position in whatever
 * list rendered it — not stored anywhere — so numbering always matches
 * however many real categories the API returned, in whatever order.
 */
export default function CategoryCard({ category, index }) {
  const blurb = getCategoryBlurb(category.name);
  const lighting = isLightingCategory(category.name);

  const fallback = lighting ? (
    <CategoryIcon name={category.name} className="h-11 w-11 text-ink-100 transition-colors duration-300 group-hover:text-gold-400" />
  ) : (
    <Package size={32} className="text-ink-100" aria-hidden="true" />
  );

  return (
    <Link
      to={`/products?category=${category.slug}`}
      className="group relative flex min-h-[230px] flex-col justify-between border border-ink-600 bg-ink-900 p-6 transition-colors duration-300 hover:bg-ink-600 sm:p-7"
    >
      {typeof index === 'number' && (
        <span className="font-tag absolute right-5 top-5 text-xs text-ink-100/50">
          {String(index + 1).padStart(2, '0')}
        </span>
      )}

      <div className="h-12 w-12 overflow-hidden rounded-lg">
        <ImageWithFallback
          src={category.imageUrl}
          alt=""
          className="h-full w-full object-cover"
          containerClassName="bg-transparent"
          fallback={fallback}
        />
      </div>

      <div className="mt-6">
        <p className="font-display text-lg font-700 text-cream">{category.name}</p>
        {blurb && <p className="mt-1.5 max-w-[26ch] text-sm text-ink-100">{blurb}</p>}
        <span className="mt-4 inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-gold">
          Shop {category.name}
          <ArrowRight size={12} className="transition-transform group-hover:translate-x-1" aria-hidden="true" />
        </span>
      </div>
    </Link>
  );
}
