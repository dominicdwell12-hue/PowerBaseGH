import { PackageSearch } from 'lucide-react';
import ProductCard from './ProductCard.jsx';

export default function ProductGrid({ products }) {
  if (!products?.length) {
    return (
      <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed border-ink-100 bg-white py-16 text-center">
        <span className="flex h-14 w-14 items-center justify-center rounded-full bg-ink-50 text-ink-400">
          <PackageSearch size={26} aria-hidden="true" />
        </span>
        <p className="text-ash">No products to show yet.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
}
