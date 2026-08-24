import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import HeroCarousel from './HeroCarousel.jsx';
import PromoBanners from '../../components/common/PromoBanners.jsx';
import WhyShopSection from '../../components/common/WhyShopSection.jsx';
import CategoryTile from '../../components/product/CategoryTile.jsx';
import ProductGrid from '../../components/product/ProductGrid.jsx';
import { ProductGridSkeleton, SkeletonBlock } from '../../components/common/Skeleton.jsx';
import ErrorState from '../../components/common/ErrorState.jsx';
import * as categoryApi from '../../api/categoryApi.js';
import * as productApi from '../../api/productApi.js';

export default function Home() {
  const categoriesQuery = useQuery({
    queryKey: ['categories'],
    queryFn: categoryApi.listCategories,
  });

  const featuredQuery = useQuery({
    queryKey: ['featuredProducts'],
    queryFn: productApi.getFeaturedProducts,
  });

  const newArrivalsQuery = useQuery({
    queryKey: ['products', 'homeNewArrivals'],
    queryFn: () => productApi.listProducts({ sort: 'newest', limit: 8 }),
  });

  // No dedicated "deals" endpoint exists in the product API — pull a
  // regular catalog page and filter client-side for items that already
  // carry a discountPrice, rather than adding a new backend filter for
  // what's still a purely presentational homepage section.
  const dealsQuery = useQuery({
    queryKey: ['products', 'homeDeals'],
    queryFn: () => productApi.listProducts({ limit: 24 }),
  });
  const dealsProducts = (dealsQuery.data?.items ?? [])
    .filter((p) => p.discountPrice && Number(p.discountPrice) < Number(p.price))
    .slice(0, 8);

  // Real max discount across those real deals — never a made-up number.
  // PromoBanners hides its deals banner entirely when this is 0.
  const maxDiscountPercent = dealsProducts.reduce((max, p) => {
    const pct = Math.round((1 - Number(p.discountPrice) / Number(p.price)) * 100);
    return Math.max(max, pct);
  }, 0);

  // Flat count (top-level + their children) of whatever categories
  // actually exist right now — feeds the hero's "N ways to shop" line.
  const categoryCount = (categoriesQuery.data ?? []).reduce(
    (total, c) => total + 1 + (c.children?.length ?? 0),
    0
  );

  // First real product photo available, used as the hero's dim backdrop
  // (see HeroCarousel) — never a stock or generated image, and the hero
  // falls back to its illustrated pendant if nothing is available yet.
  const heroImage =
    featuredQuery.data?.find((p) => p.images?.some((img) => img.imageUrl))
      ?.images?.find((img) => img.isPrimary)?.imageUrl ??
    featuredQuery.data?.[0]?.images?.[0]?.imageUrl;

  // Same idea for the "every category icon..." banner further down —
  // a real category photo (top-level or child, whichever has one first),
  // never a stock image. The banner falls back to a plain dark panel
  // (no image) if no category has a photo yet.
  const bannerImage = (categoriesQuery.data ?? []).reduce((found, category) => {
    if (found) return found;
    if (category.imageUrl) return category.imageUrl;
    return category.children?.find((child) => child.imageUrl)?.imageUrl ?? null;
  }, null);

  return (
    <div>
      <HeroCarousel categoryCount={categoryCount} heroImage={heroImage} />

      <div className="pt-8">
        <WhyShopSection />
      </div>

      <section id="categories" className="mx-auto max-w-7xl px-4 pt-14 pb-4 sm:px-6 lg:px-8">
        <div className="flex items-baseline justify-between">
          <h2 className="font-display text-2xl font-700 text-cream">Shop by category</h2>
          <Link to="/products" className="text-sm font-medium text-gold hover:underline">
            View all
          </Link>
        </div>

        {categoriesQuery.isLoading && (
          <div className="mt-6 flex gap-5 overflow-x-auto pb-2">
            {Array.from({ length: 6 }).map((_, i) => (
              // eslint-disable-next-line react/no-array-index-key
              <SkeletonBlock key={i} className="h-20 w-20 shrink-0 rounded-full sm:h-24 sm:w-24" />
            ))}
          </div>
        )}

        {categoriesQuery.isError && (
          <div className="mt-6">
            <ErrorState message={categoriesQuery.error?.message} onRetry={categoriesQuery.refetch} />
          </div>
        )}

        {categoriesQuery.data && categoriesQuery.data.length > 0 && (
          <div className="mt-6 flex gap-5 overflow-x-auto pb-2 sm:gap-7">
            {categoriesQuery.data.map((category) => (
              <CategoryTile key={category.id} category={category} />
            ))}
          </div>
        )}

        {categoriesQuery.data && categoriesQuery.data.length === 0 && (
          <p className="mt-6 text-sm text-ink-100">No categories yet — check back soon.</p>
        )}
      </section>

      <section className="mx-auto max-w-7xl px-4 pt-12 pb-4 sm:px-6 lg:px-8">
        <div className="flex items-baseline justify-between">
          <h2 className="font-display text-2xl font-700 text-cream">Featured products</h2>
          <Link to="/products" className="text-sm font-medium text-gold hover:underline">
            View all
          </Link>
        </div>
        <div className="mt-6">
          {featuredQuery.isLoading && <ProductGridSkeleton count={8} />}
          {featuredQuery.isError && (
            <ErrorState message={featuredQuery.error?.message} onRetry={featuredQuery.refetch} />
          )}
          {featuredQuery.data && featuredQuery.data.length > 0 && (
            <ProductGrid products={featuredQuery.data} />
          )}
          {featuredQuery.data && featuredQuery.data.length === 0 && (
            <p className="text-sm text-ink-100">No featured products yet — check back soon.</p>
          )}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <PromoBanners maxDiscountPercent={maxDiscountPercent} />
      </section>

      {/* Hot Deals — only rendered once real discounted products exist,
          so the section never shows an awkward "no products" empty state */}
      {dealsProducts.length > 0 && (
        <section className="mx-auto max-w-7xl px-4 pt-4 pb-4 sm:px-6 lg:px-8">
          <div className="flex items-baseline justify-between">
            <h2 className="font-display text-2xl font-700 text-cream">🔥 Hot Deals</h2>
            <Link to="/products" className="text-sm font-medium text-gold hover:underline">
              See all
            </Link>
          </div>
          <div className="mt-6">
            <ProductGrid products={dealsProducts} />
          </div>
        </section>
      )}

      <section className="mx-auto max-w-7xl px-4 pt-4 pb-16 sm:px-6 lg:px-8">
        <div className="flex items-baseline justify-between">
          <h2 className="font-display text-2xl font-700 text-cream">New Arrivals</h2>
          <Link to="/products?sort=newest" className="text-sm font-medium text-gold hover:underline">
            View all
          </Link>
        </div>
        <div className="mt-6">
          {newArrivalsQuery.isLoading && <ProductGridSkeleton count={8} />}
          {newArrivalsQuery.isError && (
            <ErrorState message={newArrivalsQuery.error?.message} onRetry={newArrivalsQuery.refetch} />
          )}
          {newArrivalsQuery.data?.items && newArrivalsQuery.data.items.length > 0 && (
            <ProductGrid products={newArrivalsQuery.data.items} />
          )}
          {newArrivalsQuery.data?.items && newArrivalsQuery.data.items.length === 0 && (
            <p className="text-sm text-ink-100">No new arrivals yet — check back soon.</p>
          )}
        </div>
      </section>

      <div className="relative overflow-hidden border-t border-ink-600 bg-ink-600/40 py-14 text-center">
        {bannerImage && (
          <>
            <img
              src={bannerImage}
              alt=""
              aria-hidden="true"
              loading="lazy"
              className="absolute inset-0 h-full w-full object-cover opacity-25"
            />
            <div
              className="absolute inset-0 bg-gradient-to-b from-ink-900/80 via-ink-900/85 to-ink-900/95"
              aria-hidden="true"
            />
          </>
        )}
        <p className="relative mx-auto max-w-2xl px-4 text-ink-100 sm:px-6 lg:px-8">
          Every category icon on this site is drawn, not photographed — and every one lights
          up.{' '}
          <span className="font-serifAccent italic text-cream">
            Hover a category. Watch it light.
          </span>
        </p>
      </div>
    </div>
  );
}
