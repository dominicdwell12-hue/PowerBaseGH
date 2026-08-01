import { Link } from 'react-router-dom';
import PriceTag from '../common/PriceTag.jsx';

export default function ProductCard({ product }) {
  const primaryImage = product.images?.find((img) => img.isPrimary) ?? product.images?.[0];
  const imageUrl = primaryImage?.imageUrl;
  const outOfStock = product.stockQuantity <= 0;
  const lowStock = !outOfStock && product.stockQuantity <= 5;

  return (
    <Link
      to={`/products/${product.slug}`}
      className="group flex flex-col overflow-hidden rounded-xl border border-ink-50
        bg-white transition-shadow hover:shadow-lg focus-visible:shadow-lg"
    >
      <div className="relative aspect-square overflow-hidden bg-ink-50">
        {imageUrl && (
          <img
            src={imageUrl}
            alt={product.name}
            loading="lazy"
            className="h-full w-full object-cover transition-transform duration-300
              group-hover:scale-105"
          />
        )}
        {product.discountPrice && (
          <span
            className="absolute left-2 top-2 rounded-tag bg-brick-DEFAULT px-2 py-0.5
              font-tag text-xs font-semibold text-paper"
          >
            Sale
          </span>
        )}
        {outOfStock && (
          <span
            className="absolute inset-0 flex items-center justify-center bg-ink-900/60
              font-display text-sm font-700 text-paper"
          >
            Out of stock
          </span>
        )}
      </div>

      <div className="flex flex-1 flex-col gap-1.5 p-3">
        <p className="text-xs text-ash">{product.category?.name}</p>
        <h3 className="line-clamp-2 font-body text-sm font-medium text-ink-900">
          {product.name}
        </h3>
        <div className="mt-auto flex items-center justify-between pt-1">
          <PriceTag
            price={product.discountPrice ?? product.price}
            compareAtPrice={product.discountPrice ? product.price : undefined}
          />
          {lowStock && (
            <span className="text-xs font-medium text-brick-600">
              Only {product.stockQuantity} left
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}
