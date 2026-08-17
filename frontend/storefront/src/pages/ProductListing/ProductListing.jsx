import { useMemo } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ArrowLeft } from 'lucide-react';
import FilterSidebar from '../../components/product/FilterSidebar.jsx';
import ProductGrid from '../../components/product/ProductGrid.jsx';
import CategoryCard from '../../components/product/CategoryCard.jsx';
import Pagination from '../../components/common/Pagination.jsx';
import { ProductGridSkeleton } from '../../components/common/Skeleton.jsx';
import ErrorState from '../../components/common/ErrorState.jsx';
import { getCategoryBlurb } from '../../data/lightingCategories.js';
import * as productApi from '../../api/productApi.js';
import * as categoryApi from '../../api/categoryApi.js';

const SORT_OPTIONS = [
  { value: '', label: 'Relevance' },
  { value: 'newest', label: 'Newest' },
  { value: 'price_asc', label: 'Price: low to high' },
  { value: 'price_desc', label: 'Price: high to low' },
  { value: 'rating', label: 'Highest rated' },
];

export default function ProductListing() {
  const [searchParams, setSearchParams] = useSearchParams();

  const filters = useMemo(
    () => ({
      category: searchParams.get('category') || undefined,
      search: searchParams.get('search') || undefined,
      minPrice: searchParams.get('minPrice') || undefined,
      maxPrice: searchParams.get('maxPrice') || undefined,
      sort: searchParams.get('sort') || undefined,
      page: Number(searchParams.get('page')) || 1,
    }),
    [searchParams]
  );

  function updateFilters(patch) {
    const next = new URLSearchParams(searchParams);
    Object.entries(patch).forEach(([key, value]) => {
      if (value === undefined || value === '') next.delete(key);
      else next.set(key, value);
    });
    // Any real filter change resets pagination back to page 1.
    if (!('page' in patch)) next.delete('page');
    setSearchParams(next);
  }

  const categoriesQuery = useQuery({ queryKey: ['categories'], queryFn: categoryApi.listCategories });

  // Real category API returns top-level categories with their children
  // nested (see categoryApi.listCategories). Look up whichever one
  // matches the URL's ?category= slug, if any.
  const activeCategory = categoriesQuery.data?.find((c) => c.slug === filters.category);
  const activeCategoryName = activeCategory?.name;

  // A "group" is a real top-level category that has real subcategories —
  // nothing here is invented, it's exactly what the API returned. When the
  // URL points at one (and there's no active search), show its
  // subcategories as browsable tiles instead of an empty product grid,
  // since products are only ever assigned to leaf categories.
  const isGroupView = Boolean(activeCategory?.children?.length) && !filters.search;

  const productsQuery = useQuery({
    queryKey: ['products', filters],
    queryFn: () => productApi.listProducts({ ...filters, limit: 12 }),
    placeholderData: (previousData) => previousData,
    enabled: !isGroupView,
  });

  if (isGroupView) {
    const groupBlurb = getCategoryBlurb(activeCategory.name);
    return (
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <Link to="/products" className="inline-flex items-center gap-1.5 text-sm text-ink-100 hover:text-gold">
          <ArrowLeft size={14} aria-hidden="true" />
          All products
        </Link>

        <p className="mt-6 font-tag text-xs uppercase tracking-widest text-gold">{activeCategory.name}</p>
        <h1 className="mt-2 max-w-2xl font-display text-3xl font-800 text-cream sm:text-4xl">
          {groupBlurb ?? `Shop ${activeCategory.name}`}
        </h1>

        <div className="mt-10 grid grid-cols-1 gap-px border border-ink-600 bg-ink-600 sm:grid-cols-2 lg:grid-cols-4">
          {activeCategory.children.map((child, index) => (
            <CategoryCard key={child.id} category={child} index={index} />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <h1 className="font-display text-2xl font-800 text-ink-900">
        {filters.search ? `Results for "${filters.search}"` : activeCategoryName || 'All products'}
      </h1>

      <div className="mt-6 flex flex-col gap-8 lg:flex-row">
        <FilterSidebar
          categories={categoriesQuery.data}
          filters={filters}
          onChange={updateFilters}
        />

        <div className="flex-1">
          <div className="mb-4 flex items-center justify-end">
            <label className="flex items-center gap-2 text-sm text-ash">
              Sort by
              <select
                value={filters.sort ?? ''}
                onChange={(e) => updateFilters({ sort: e.target.value })}
                className="rounded-lg border border-ink-100 px-2 py-1.5 text-sm text-ink-900"
              >
                {SORT_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </label>
          </div>

          {productsQuery.isLoading && <ProductGridSkeleton count={12} />}

          {productsQuery.isError && (
            <ErrorState message={productsQuery.error?.message} onRetry={productsQuery.refetch} />
          )}

          {productsQuery.data && (
            <>
              <ProductGrid products={productsQuery.data.items} />
              <Pagination
                page={productsQuery.data.pagination.page}
                totalPages={productsQuery.data.pagination.totalPages}
                onChange={(page) => updateFilters({ page: String(page) })}
              />
            </>
          )}
        </div>
      </div>
    </div>
  );
}
