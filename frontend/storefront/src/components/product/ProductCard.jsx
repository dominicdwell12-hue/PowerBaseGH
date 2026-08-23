import { Link, useNavigate } from 'react-router-dom';
import { Heart, Plus } from 'lucide-react';
import PriceTag from '../common/PriceTag.jsx';
import ImageWithFallback from '../common/ImageWithFallback.jsx';
import CategoryIcon, { isLightingCategory } from './CategoryIcon.jsx';
import { useCart } from '../../hooks/useCart.js';
import { useWishlist } from '../../hooks/useWishlist.js';
import { useAuth } from '../../hooks/useAuth.js';

export default function ProductCard({ product }) {
  const primaryImage = product.images?.find((img) => img.isPrimary) ?? product.images?.[0];
  const imageUrl = primaryImage?.imageUrl;
  // Same fallback treatment as CategoryCard — a lit fixture icon beats a
  // broken-image glyph while real product photography is still pending.
  const lighting = isLightingCategory(product.category?.name);
  const imageFallback = lighting ? (
    <CategoryIcon name={product.category?.name} className="h-16 w-16 text-ink-100" />
  ) : undefined;
  const outOfStock = product.stockQuantity <= 0;
  const lowStock = !outOfStock && product.stockQuantity <= 5;
  const hasDiscount = product.discountPrice && Number(product.discountPrice) < Number(product.price);
  const discountPercent = hasDiscount
    ? Math.round((1 - Number(product.discountPrice) / Number(product.price)) * 100)
    : null;

  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const { addItem, isAdding } = useCart();
  const { productIds, addItem: addWishlistItem, removeItem: removeWishlistItem } = useWishlist();
  const inWishlist = productIds.has(product.id);

  function handleWishlistClick(e) {
    e.preventDefault();
    e.stopPropagation();
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    if (inWishlist) {
      removeWishlistItem(product.id);
    } else {
      addWishlistItem(product.id);
    }
  }

  function handleQuickAdd(e) {
    e.preventDefault();
    e.stopPropagation();
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    if (outOfStock) return;
    addItem({ productId: product.id, quantity: 1 });
  }

  return (
    <Link
      to={`/products/${product.slug}`}
      className="group relative flex flex-col overflow-hidden rounded-xl border border-ink-600
        bg-ink-600 transition-all hover:-translate-y-0.5 hover:border-gold/40 hover:shadow-[0_8px_30px_-12px_rgba(201,138,44,0.4)]
        focus-visible:-translate-y-0.5"
    >
      <div className="relative aspect-square overflow-hidden bg-ink-400">
        <ImageWithFallback
          src={imageUrl}
          alt={product.name}
          className="h-full w-full object-cover transition-transform duration-300
            group-hover:scale-105"
          fallback={imageFallback}
        />

        {hasDiscount && (
          <span
            className="absolute left-2 top-2 rounded-md bg-gold px-2 py-0.5
              text-xs font-bold text-ink-900"
          >
            -{discountPercent}%
          </span>
        )}

        <button
          type="button"
          onClick={handleWishlistClick}
          aria-label={inWishlist ? 'Remove from wishlist' : 'Add to wishlist'}
          aria-pressed={inWishlist}
          className="absolute right-2 top-2 flex h-8 w-8 items-center justify-center rounded-full
            bg-ink-900/70 text-cream backdrop-blur transition-colors hover:text-magenta"
        >
          <Heart size={16} aria-hidden="true" fill={inWishlist ? 'currentColor' : 'none'} className={inWishlist ? 'text-magenta' : ''} />
        </button>

        {outOfStock && (
          <span
            className="absolute inset-0 flex items-center justify-center bg-ink-900/70
              font-display text-sm font-700 text-cream"
          >
            Out of stock
          </span>
        )}

        {!outOfStock && (
          <button
            type="button"
            onClick={handleQuickAdd}
            disabled={isAdding}
            aria-label="Add to cart"
            className="absolute bottom-2 right-2 flex h-8 w-8 items-center justify-center rounded-full
              border border-gold/60 bg-ink-900/80 text-gold shadow-lg backdrop-blur transition-colors
              hover:bg-gold hover:text-ink-900 disabled:opacity-50"
          >
            <Plus size={16} aria-hidden="true" />
          </button>
        )}
      </div>

      <div className="flex flex-1 flex-col gap-1.5 p-3">
        {product.category?.name && (
          <p className="text-[11px] uppercase tracking-wide text-ink-100">{product.category.name}</p>
        )}
        <h3 className="line-clamp-2 font-body text-sm font-medium text-cream">
          {product.name}
        </h3>
        <div className="mt-auto flex items-center justify-between pt-1">
          <PriceTag
            price={product.discountPrice ?? product.price}
            compareAtPrice={product.discountPrice ? product.price : undefined}
          />
          {lowStock && (
            <span className="text-xs font-medium text-magenta">
              Only {product.stockQuantity} left
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}
