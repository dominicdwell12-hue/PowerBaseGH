import { Link, useNavigate } from 'react-router-dom';
import { Heart, ChevronRight } from 'lucide-react';
import Spinner from '../../components/common/Spinner.jsx';
import ErrorState from '../../components/common/ErrorState.jsx';
import Button from '../../components/common/Button.jsx';
import PriceTag from '../../components/common/PriceTag.jsx';
import { useWishlist } from '../../hooks/useWishlist.js';
import { useCart } from '../../hooks/useCart.js';
import { useAuth } from '../../hooks/useAuth.js';

export default function Wishlist() {
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { items, isLoading, isError, error, refetch, removeItem } = useWishlist();
  const { addItem, isAdding } = useCart();

  if (authLoading) return <Spinner label="Loading wishlist" />;

  if (!isAuthenticated) {
    return (
      <div className="mx-auto max-w-lg px-4 py-20 text-center sm:px-6">
        <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-ink-600 text-gold">
          <Heart size={24} aria-hidden="true" />
        </span>
        <h1 className="mt-5 font-display text-2xl font-800 text-cream">Your wishlist</h1>
        <p className="mt-3 text-ink-100">Sign in to see products you've saved.</p>
        <Button className="mt-6" onClick={() => navigate('/login')}>
          Sign in
        </Button>
      </div>
    );
  }

  if (isLoading) return <Spinner label="Loading wishlist" />;

  if (isError) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-16 sm:px-6">
        <ErrorState message={error?.message} onRetry={refetch} />
      </div>
    );
  }

  if (!items.length) {
    return (
      <div className="mx-auto max-w-lg px-4 py-20 text-center sm:px-6">
        <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-ink-600 text-gold">
          <Heart size={24} aria-hidden="true" />
        </span>
        <h1 className="mt-5 font-display text-2xl font-800 text-cream">Your wishlist is empty</h1>
        <p className="mt-3 text-ink-100">Save products you like so you can find them again.</p>
        <Button className="mt-6" onClick={() => navigate('/products')}>
          Browse products
        </Button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-xs text-ink-100">
        <Link to="/" className="hover:text-gold">Home</Link>
        <ChevronRight size={12} aria-hidden="true" />
        <span className="text-cream">Wishlist</span>
      </nav>
      <h1 className="mt-2 font-display text-2xl font-800 text-cream sm:text-3xl">Your wishlist</h1>

      <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        {items.map(({ id, product }) => (
          <div key={id} className="flex flex-col overflow-hidden rounded-xl border border-ink-600 bg-ink-600">
            <Link to={`/products/${product.slug}`} className="relative aspect-square overflow-hidden bg-ink-400/20">
              {product.image && (
                <img src={product.image} alt={product.name} loading="lazy" className="h-full w-full object-cover" />
              )}
              {!product.inStock && (
                <span className="absolute inset-0 flex items-center justify-center bg-ink-900/60 font-display text-sm font-700 text-paper">
                  Out of stock
                </span>
              )}
            </Link>
            <div className="flex flex-1 flex-col gap-2 p-3">
              <Link to={`/products/${product.slug}`} className="line-clamp-2 text-sm font-medium text-cream hover:underline">
                {product.name}
              </Link>
              <PriceTag
                price={product.discountPrice ?? product.price}
                compareAtPrice={product.discountPrice ? product.price : undefined}
              />
              <div className="mt-auto flex gap-2 pt-1">
                <Button
                  className="flex-1"
                  disabled={!product.inStock || isAdding}
                  onClick={() => addItem({ productId: product.id, quantity: 1 })}
                >
                  Add to cart
                </Button>
                <button
                  type="button"
                  onClick={() => removeItem(product.id)}
                  aria-label="Remove from wishlist"
                  className="rounded-lg border border-ink-600 px-2 text-brick-400 hover:bg-brick/10"
                >
                  ✕
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
