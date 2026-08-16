import { Link } from 'react-router-dom';
import CategoryIcon, { isLightingCategory } from './CategoryIcon.jsx';

export default function CategoryTile({ category }) {
  const lighting = isLightingCategory(category.name);

  return (
    <Link
      to={`/products?category=${category.slug}`}
      className="group flex flex-col items-center gap-2 rounded-xl border border-ink-50
        bg-white p-3 text-center transition-colors hover:border-gold-400"
    >
      <div className="flex aspect-square w-full items-center justify-center overflow-hidden rounded-lg bg-ink-50">
        {category.imageUrl ? (
          <img
            src={category.imageUrl}
            alt=""
            loading="lazy"
            className="h-full w-full object-cover transition-transform duration-300
              group-hover:scale-105"
          />
        ) : (
          // No real product photo for this category yet — show its fixture
          // icon instead of an empty tile. Lights up gold on hover, same as
          // everywhere else CategoryIcon appears (see index.css).
          lighting && <CategoryIcon name={category.name} className="h-9 w-9 text-ink-400" />
        )}
      </div>
      <span className="font-body text-sm font-medium text-ink-900">{category.name}</span>
    </Link>
  );
}
