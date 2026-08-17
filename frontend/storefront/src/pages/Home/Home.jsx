import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import HeroCarousel from './HeroCarousel.jsx';
import PromoBanners from '../../components/common/PromoBanners.jsx';
import WhyShopSection from '../../components/common/WhyShopSection.jsx';
import CategoryCard from '../../components/product/CategoryCard.jsx';
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

  return (
    <div>
      <HeroCarousel categoryCount={categoryCount} />

      <section className="mx-auto max-w-7xl px-4 pt-16 pb-4 sm:px-6 lg:px-8">
        <div className="flex items-baseline justify-between">
          <h2 className="font-display text-2xl font-700 text-cream">Shop by category</h2>
          <Link to="/products" className="text-sm font-medium text-gold hover:underline">
            View all products
          </Link>
        </div>

        {categoriesQuery.isLoading && (
          <div className="mt-6 grid grid-cols-1 gap-px border border-ink-600 bg-ink-600 sm:grid-cols-2 lg:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
              // eslint-disable-next-line react/no-array-index-key
              <SkeletonBlock key={i} className="min-h-[230px] w-full" />
            ))}
          </div>
        )}

        {categoriesQuery.isError && (
          <div className="mt-6">
            <ErrorState
              message={categoriesQuery.error?.message}
              onRetry={categoriesQuery.refetch}
            />
          </div>
        )}

        {categoriesQuery.data && categoriesQuery.data.length > 0 && (
          <div className="mt-6 grid grid-cols-1 gap-px border border-ink-600 bg-ink-600 sm:grid-cols-2 lg:grid-cols-4">
            {categoriesQuery.data.map((category, index) => (
              <CategoryCard key={category.id} category={category} index={index} />
            ))}
          </div>
        )}

        {categoriesQuery.data && categoriesQuery.data.length === 0 && (
          <p className="mt-6 text-sm text-ink-100">No categories yet — check back soon.</p>
        )}
      </section>

      {/* Hot Deals — only rendered once real discounted products exist,
          so the section never shows an awkward "no products" empty state */}
      {dealsProducts.length > 0 && (
        <section className="mx-auto max-w-7xl px-4 pt-12 pb-4 sm:px-6 lg:px-8">
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

      <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <PromoBanners maxDiscountPercent={maxDiscountPercent} />
      </section>

      <section className="mx-auto max-w-7xl px-4 pb-16 sm:px-6 lg:px-8">
        <div className="flex items-baseline justify-between">
          <h2 className="font-display text-2xl font-700 text-cream">Featured products</h2>
          <Link to="/products" className="text-sm font-medium text-gold hover:underline">
            See all
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

      <div className="border-t border-ink-600 bg-ink-600/40 py-10 text-center">
        <p className="mx-auto max-w-2xl px-4 text-ink-100 sm:px-6 lg:px-8">
          Every category icon on this site is drawn, not photographed — and every one lights
          up.{' '}
          <span className="font-serifAccent italic text-cream">
            Hover a category. Watch it light.
          </span>
        </p>
      </div>

      <div className="border-t border-ink-600">
        <WhyShopSection />
      </div>
    </div>
  );
}
