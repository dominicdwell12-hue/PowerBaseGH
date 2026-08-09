import { useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import FilterSidebar from '../../components/product/FilterSidebar.jsx';
import ProductGrid from '../../components/product/ProductGrid.jsx';
import Pagination from '../../components/common/Pagination.jsx';
import { ProductGridSkeleton } from '../../components/common/Skeleton.jsx';
import ErrorState from '../../components/common/ErrorState.jsx';
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

  const productsQuery = useQuery({
    queryKey: ['products', filters],
    queryFn: () => productApi.listProducts({ ...filters, limit: 12 }),
    placeholderData: (previousData) => previousData,
  });

  const activeCategoryName = categoriesQuery.data?.find((c) => c.slug === filters.category)?.name;

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
