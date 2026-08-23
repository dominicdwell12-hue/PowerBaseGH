import { Link } from 'react-router-dom';
import CategoryIcon, { isLightingCategory } from './CategoryIcon.jsx';

/**
 * Circular category avatar used in the homepage "Shop by category" row
 * (see reference design) — real category photo when the admin has
 * uploaded one, otherwise this category's hand-drawn fixture icon.
 * `productCount` comes straight from the live API's `_count` (see
 * categoryApi.js / backend category.service.js); the caption is only
 * rendered when that number is real, never guessed.
 */
export default function CategoryTile({ category }) {
  const lighting = isLightingCategory(category.name);

  return (
    <Link
      to={`/products?category=${category.slug}`}
      className="group flex w-20 shrink-0 flex-col items-center gap-2 text-center sm:w-24"
    >
      <span
        className="flex aspect-square w-20 items-center justify-center overflow-hidden rounded-full
          border border-ink-600 bg-ink-600 ring-2 ring-transparent transition-all
          group-hover:ring-gold/60 group-focus-visible:ring-gold/60 sm:w-24"
      >
        {category.imageUrl ? (
          <img
            src={category.imageUrl}
            alt=""
            loading="lazy"
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          lighting && (
            <CategoryIcon name={category.name} className="h-9 w-9 text-ink-100" />
          )
        )}
      </span>
      <span className="font-body text-xs font-semibold leading-tight text-cream">{category.name}</span>
      {typeof category.productCount === 'number' && (
        <span className="text-[11px] text-ink-100">{category.productCount} items</span>
      )}
    </Link>
  );
}
