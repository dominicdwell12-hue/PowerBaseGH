import { useState } from 'react';
import { useParams, useNavigate, useLocation, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import PriceTag from '../../components/common/PriceTag.jsx';
import Button from '../../components/common/Button.jsx';
import QuantityStepper from '../../components/common/QuantityStepper.jsx';
import Spinner from '../../components/common/Spinner.jsx';
import ErrorState from '../../components/common/ErrorState.jsx';
import ProductGrid from '../../components/product/ProductGrid.jsx';
import { SkeletonBlock } from '../../components/common/Skeleton.jsx';
import { useAuth } from '../../hooks/useAuth.js';
import { useCart } from '../../hooks/useCart.js';
import { useWishlist } from '../../hooks/useWishlist.js';
import * as productApi from '../../api/productApi.js';

export default function ProductDetails() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated } = useAuth();
  const { addItem, isAdding } = useCart();
  const { addItem: addToWishlist, productIds: wishlistProductIds } = useWishlist();

  const [activeImage, setActiveImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [feedback, setFeedback] = useState(null);

  const productQuery = useQuery({
    queryKey: ['product', slug],
    queryFn: () => productApi.getProductBySlug(slug),
  });

  const relatedQuery = useQuery({
    queryKey: ['relatedProducts', slug],
    queryFn: () => productApi.getRelatedProducts(slug),
    enabled: Boolean(productQuery.data),
  });

  if (productQuery.isLoading) {
    return (
      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-10 sm:px-6 lg:px-8 md:grid-cols-2">
        <SkeletonBlock className="aspect-square w-full" />
        <div className="space-y-3">
          <SkeletonBlock className="h-4 w-1/3" />
          <SkeletonBlock className="h-8 w-full" />
          <SkeletonBlock className="h-6 w-1/2" />
          <SkeletonBlock className="h-24 w-full" />
        </div>
      </div>
    );
  }

  if (productQuery.isError) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <ErrorState
          title="Couldn't load this product"
          message={productQuery.error?.message}
          onRetry={productQuery.refetch}
        />
      </div>
    );
  }

  const product = productQuery.data;
  const images = product.images?.length ? product.images : [{ imageUrl: null }];
  const outOfStock = product.stockQuantity <= 0;
  const inWishlist = wishlistProductIds.has(product.id);

  function requireAuth() {
    if (isAuthenticated) return true;
    navigate('/login', { state: { from: location } });
    return false;
  }

  async function handleAddToCart() {
    if (!requireAuth()) return;
    setFeedback(null);
    try {
      await addItem({ productId: product.id, quantity });
      setFeedback({ type: 'success', message: 'Added to cart.' });
    } catch (err) {
      setFeedback({ type: 'error', message: err?.message ?? 'Could not add to cart.' });
    }
  }

  async function handleAddToWishlist() {
    if (!requireAuth()) return;
    try {
      await addToWishlist(product.id);
      setFeedback({ type: 'success', message: 'Saved to wishlist.' });
    } catch (err) {
      setFeedback({ type: 'error', message: err?.message ?? 'Could not save to wishlist.' });
    }
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="grid gap-8 md:grid-cols-2">
        <div>
          <div className="aspect-square overflow-hidden rounded-xl bg-ink-50">
            {images[activeImage]?.imageUrl && (
              <img
                src={images[activeImage].imageUrl}
                alt={product.name}
                className="h-full w-full object-cover"
              />
            )}
          </div>
          {images.length > 1 && (
            <div className="mt-3 flex gap-2">
              {images.map((img, i) => (
                <button
                  key={img.id ?? i}
                  type="button"
                  onClick={() => setActiveImage(i)}
                  className={`h-16 w-16 shrink-0 overflow-hidden rounded-lg border-2 ${
                    i === activeImage ? 'border-gold-DEFAULT' : 'border-transparent'
                  }`}
                >
                  {img.imageUrl && (
                    <img src={img.imageUrl} alt="" loading="lazy" className="h-full w-full object-cover" />
                  )}
                </button>
              ))}
            </div>
          )}
        </div>

        <div>
          <Link
            to={`/products?category=${product.category?.slug}`}
            className="text-sm text-gold-700 hover:underline"
          >
            {product.category?.name}
          </Link>
          <h1 className="mt-1 font-display text-2xl font-800 text-ink-900">{product.name}</h1>
          {product.brand && <p className="mt-1 text-sm text-ash">Brand: {product.brand}</p>}

          <div className="mt-4">
            <PriceTag
              size="lg"
              price={product.discountPrice ?? product.price}
              compareAtPrice={product.discountPrice ? product.price : undefined}
            />
          </div>

          <p className="mt-2 text-sm">
            {outOfStock ? (
              <span className="font-semibold text-brick-600">Out of stock</span>
            ) : product.stockQuantity <= 5 ? (
              <span className="font-semibold text-brick-600">
                Only {product.stockQuantity} left in stock
              </span>
            ) : (
              <span className="font-semibold text-forest-600">In stock</span>
            )}
          </p>

          <p className="mt-4 whitespace-pre-line text-sm text-ink-900">{product.description}</p>

          <div className="mt-6 flex items-center gap-4">
            <QuantityStepper
              value={quantity}
              onChange={setQuantity}
              max={Math.max(1, product.stockQuantity)}
              disabled={outOfStock}
            />
            <Button onClick={handleAddToCart} disabled={outOfStock || isAdding}>
              {isAdding ? 'Adding…' : 'Add to cart'}
            </Button>
            <Button variant="outline" onClick={handleAddToWishlist} disabled={inWishlist}>
              {inWishlist ? 'In wishlist' : 'Add to wishlist'}
            </Button>
          </div>

          {feedback && (
            <p
              className={`mt-3 text-sm ${
                feedback.type === 'success' ? 'text-forest-600' : 'text-brick-600'
              }`}
              role="status"
            >
              {feedback.message}
            </p>
          )}
        </div>
      </div>

      <section className="mt-16">
        <h2 className="font-display text-xl font-700 text-ink-900">You may also like</h2>
        <div className="mt-6">
          {relatedQuery.isLoading && <Spinner label="Loading related products" />}
          {relatedQuery.data && <ProductGrid products={relatedQuery.data} />}
        </div>
      </section>
    </div>
  );
}
