import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../../hooks/useCart.js';
import { useAuth } from '../../hooks/useAuth.js';
import Button from '../../components/common/Button.jsx';
import Spinner from '../../components/common/Spinner.jsx';
import ErrorState from '../../components/common/ErrorState.jsx';
import QuantityStepper from '../../components/common/QuantityStepper.jsx';
import { formatCurrency } from '../../utils/formatCurrency.js';

export default function Cart() {
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const navigate = useNavigate();
  const {
    items,
    subtotal,
    hasUnavailableItems,
    isLoading,
    isError,
    error,
    refetch,
    updateItem,
    removeItem,
  } = useCart();

  if (authLoading) return <Spinner label="Loading cart" />;

  if (!isAuthenticated) {
    return (
      <div className="mx-auto max-w-lg px-4 py-16 text-center sm:px-6">
        <h1 className="font-display text-2xl font-800 text-ink-900">Your cart</h1>
        <p className="mt-3 text-ash">Sign in to see items you've added to your cart.</p>
        <Button className="mt-6" onClick={() => navigate('/login')}>
          Sign in
        </Button>
      </div>
    );
  }

  if (isLoading) return <Spinner label="Loading cart" />;

  if (isError) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-16 sm:px-6">
        <ErrorState message={error?.message} onRetry={refetch} />
      </div>
    );
  }

  if (!items.length) {
    return (
      <div className="mx-auto max-w-lg px-4 py-16 text-center sm:px-6">
        <h1 className="font-display text-2xl font-800 text-ink-900">Your cart is empty</h1>
        <p className="mt-3 text-ash">Add something you like and it'll show up here.</p>
        <Button className="mt-6" onClick={() => navigate('/products')}>
          Start shopping
        </Button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
      <h1 className="font-display text-2xl font-800 text-ink-900">Your cart</h1>

      <div className="mt-8 grid gap-8 lg:grid-cols-3">
        <ul className="space-y-4 lg:col-span-2">
          {items.map((item) => (
            <li
              key={item.id}
              className="flex gap-4 rounded-xl border border-ink-50 bg-white p-4"
            >
              <Link to={`/products/${item.slug}`} className="h-20 w-20 shrink-0 overflow-hidden rounded-lg bg-ink-50">
                {item.image && (
                  <img src={item.image} alt={item.name} loading="lazy" className="h-full w-full object-cover" />
                )}
              </Link>

              <div className="flex flex-1 flex-col justify-between">
                <div>
                  <Link to={`/products/${item.slug}`} className="font-body text-sm font-medium text-ink-900 hover:underline">
                    {item.name}
                  </Link>
                  {!item.isAvailable && (
                    <p className="mt-1 text-xs font-semibold text-brick-600">No longer available</p>
                  )}
                  {item.isAvailable && !item.inStock && (
                    <p className="mt-1 text-xs font-semibold text-brick-600">
                      Only {item.stockQuantity} in stock — reduce quantity
                    </p>
                  )}
                </div>
                <div className="flex items-center justify-between">
                  <QuantityStepper
                    value={item.quantity}
                    max={Math.max(1, item.stockQuantity)}
                    onChange={(quantity) => updateItem({ itemId: item.id, quantity })}
                  />
                  <button
                    type="button"
                    onClick={() => removeItem(item.id)}
                    className="text-xs font-medium text-brick-600 hover:underline"
                  >
                    Remove
                  </button>
                </div>
              </div>

              <p className="font-tag text-sm font-semibold text-ink-900">
                {formatCurrency(item.lineTotal)}
              </p>
            </li>
          ))}
        </ul>

        <div className="h-fit rounded-xl border border-ink-50 bg-white p-5">
          <h2 className="font-display text-lg font-700 text-ink-900">Order summary</h2>
          <div className="mt-4 flex justify-between text-sm text-ash">
            <span>Subtotal</span>
            <span className="font-tag text-ink-900">{formatCurrency(subtotal)}</span>
          </div>
          <p className="mt-1 text-xs text-ash">Delivery fee is calculated at checkout.</p>

          {hasUnavailableItems && (
            <p className="mt-3 text-xs font-semibold text-brick-600">
              Remove or update unavailable items before checking out.
            </p>
          )}

          <Button
            className="mt-4 w-full"
            disabled={hasUnavailableItems}
            onClick={() => navigate('/checkout')}
          >
            Proceed to checkout
          </Button>
        </div>
      </div>
    </div>
  );
}
