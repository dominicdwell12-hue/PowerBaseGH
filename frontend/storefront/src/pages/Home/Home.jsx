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

  return (
    <div>
      <HeroCarousel />

      <section className="mx-auto max-w-7xl px-4 pt-16 pb-4 sm:px-6 lg:px-8">
        <div className="flex items-baseline justify-between">
          <h2 className="font-display text-2xl font-700 text-cream">Shop by category</h2>
          <Link to="/products" className="text-sm font-medium text-gold hover:underline">
            View all categories
          </Link>
        </div>

        {categoriesQuery.isLoading && (
          <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              // eslint-disable-next-line react/no-array-index-key
              <SkeletonBlock key={i} className="aspect-[4/3] w-full" />
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

        {categoriesQuery.data && (
          <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3">
            {categoriesQuery.data.slice(0, 6).map((category) => (
              <CategoryCard key={category.id} category={category} />
            ))}
          </div>
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
        <PromoBanners />
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
          {featuredQuery.data && <ProductGrid products={featuredQuery.data} />}
        </div>
      </section>

      <div className="border-t border-ink-600">
        <WhyShopSection />
      </div>
    </div>
  );
}
