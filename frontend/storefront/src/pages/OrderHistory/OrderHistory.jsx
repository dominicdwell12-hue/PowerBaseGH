import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { ChevronRight } from 'lucide-react';
import Spinner from '../../components/common/Spinner.jsx';
import ErrorState from '../../components/common/ErrorState.jsx';
import StatusBadge from '../../components/common/StatusBadge.jsx';
import Pagination from '../../components/common/Pagination.jsx';
import Button from '../../components/common/Button.jsx';
import { formatCurrency } from '../../utils/formatCurrency.js';
import { CANCELLABLE_STATUSES } from '../../utils/constants.js';
import * as orderApi from '../../api/orderApi.js';

export default function OrderHistory() {
  const [page, setPage] = useState(1);
  const queryClient = useQueryClient();

  const ordersQuery = useQuery({
    queryKey: ['orders', page],
    queryFn: () => orderApi.listOrders({ page, limit: 10 }),
    placeholderData: (prev) => prev,
  });

  const cancelMutation = useMutation({
    mutationFn: (orderNumber) => orderApi.cancelOrder(orderNumber),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['orders'] }),
  });

  if (ordersQuery.isLoading) return <Spinner label="Loading your orders" />;

  if (ordersQuery.isError) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-16 sm:px-6">
        <ErrorState message={ordersQuery.error?.message} onRetry={ordersQuery.refetch} />
      </div>
    );
  }

  const { orders, pagination } = ordersQuery.data;

  if (!orders.length) {
    return (
      <div className="mx-auto max-w-lg px-4 py-20 text-center sm:px-6">
        <h1 className="font-display text-2xl font-800 text-cream">No orders yet</h1>
        <p className="mt-3 text-ink-100">Orders you place will show up here.</p>
        <Button className="mt-6" as={Link} to="/products">
          Start shopping
        </Button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
      <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-xs text-ink-100">
        <Link to="/" className="hover:text-gold">Home</Link>
        <ChevronRight size={12} aria-hidden="true" />
        <span className="text-cream">Your orders</span>
      </nav>
      <h1 className="mt-2 font-display text-2xl font-800 text-cream sm:text-3xl">Your orders</h1>

      <ul className="mt-6 space-y-4">
        {orders.map((order) => (
          <li key={order.orderNumber} className="rounded-xl border border-ink-600 bg-ink-600 p-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <Link
                  to={`/orders/${order.orderNumber}`}
                  className="font-tag text-sm font-semibold text-cream hover:underline"
                >
                  {order.orderNumber}
                </Link>
                <p className="text-xs text-ink-100">
                  {new Date(order.createdAt).toLocaleDateString('en-GB', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric',
                  })}
                </p>
              </div>
              <StatusBadge status={order.status} />
            </div>

            <p className="mt-2 text-sm text-ink-100">
              {order.items.length} item{order.items.length === 1 ? '' : 's'} ·{' '}
              <span className="font-tag text-cream">{formatCurrency(order.total)}</span>
            </p>

            <div className="mt-3 flex gap-3">
              <Link
                to={`/orders/${order.orderNumber}`}
                className="text-sm font-medium text-gold-700 hover:underline"
              >
                Track order
              </Link>
              {CANCELLABLE_STATUSES.includes(order.status) && (
                <button
                  type="button"
                  onClick={() => cancelMutation.mutate(order.orderNumber)}
                  disabled={cancelMutation.isPending}
                  className="text-sm font-medium text-brick-400 hover:underline disabled:opacity-50"
                >
                  Cancel order
                </button>
              )}
            </div>
          </li>
        ))}
      </ul>

      <Pagination page={pagination.page} totalPages={pagination.totalPages} onChange={setPage} />
    </div>
  );
}
