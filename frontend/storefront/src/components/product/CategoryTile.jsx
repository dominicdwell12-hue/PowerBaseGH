import { Link } from 'react-router-dom';

export default function CategoryTile({ category }) {
  return (
    <Link
      to={`/products?category=${category.slug}`}
      className="group flex flex-col items-center gap-2 rounded-xl border border-ink-50
        bg-white p-3 text-center transition-colors hover:border-gold-400"
    >
      <div className="aspect-square w-full overflow-hidden rounded-lg bg-ink-50">
        {category.imageUrl && (
          <img
            src={category.imageUrl}
            alt=""
            loading="lazy"
            className="h-full w-full object-cover transition-transform duration-300
              group-hover:scale-105"
          />
        )}
      </div>
      <span className="font-body text-sm font-medium text-ink-900">{category.name}</span>
    </Link>
  );
}
