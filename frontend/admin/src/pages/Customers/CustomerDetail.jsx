import { useParams, Link } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import Spinner from '../../components/common/Spinner.jsx';
import ErrorState from '../../components/common/ErrorState.jsx';
import StatusBadge from '../../components/common/StatusBadge.jsx';
import Button from '../../components/common/Button.jsx';
import { formatCurrency } from '../../utils/formatCurrency.js';
import * as customerApi from '../../api/customerApi.js';

export default function CustomerDetail() {
  const { id } = useParams();
  const queryClient = useQueryClient();

  const customerQuery = useQuery({
    queryKey: ['adminCustomer', id],
    queryFn: () => customerApi.getCustomerDetail(Number(id)),
  });

  const statusMutation = useMutation({
    mutationFn: (isActive) => customerApi.updateCustomerStatus(Number(id), isActive),
    onSuccess: (updated) => {
      queryClient.setQueryData(['adminCustomer', id], (prev) => ({ ...prev, ...updated }));
      queryClient.invalidateQueries({ queryKey: ['adminCustomers'] });
    },
  });

  if (customerQuery.isLoading) return <Spinner label="Loading customer" />;
  if (customerQuery.isError) return <ErrorState message={customerQuery.error?.message} onRetry={customerQuery.refetch} />;

  const customer = customerQuery.data;

  return (
    <div className="max-w-2xl space-y-6">
      <Link to="/customers" className="text-sm text-gold-700 hover:underline">
        ← All customers
      </Link>

      <div className="flex items-start justify-between">
        <div>
          <h1 className="font-display text-2xl font-800 text-ink-900">{customer.name}</h1>
          <p className="text-sm text-ash">
            {customer.email} · {customer.phone}
          </p>
        </div>
        <Button
          variant={customer.isActive ? 'danger' : 'primary'}
          disabled={statusMutation.isPending}
          onClick={() => statusMutation.mutate(!customer.isActive)}
        >
          {customer.isActive ? 'Deactivate account' : 'Activate account'}
        </Button>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="rounded-xl border border-ink-50 bg-white p-4">
          <p className="text-xs uppercase tracking-wide text-ash">Lifetime orders</p>
          <p className="mt-1 font-tag text-xl font-semibold text-ink-900">{customer.stats.totalOrders}</p>
        </div>
        <div className="rounded-xl border border-ink-50 bg-white p-4">
          <p className="text-xs uppercase tracking-wide text-ash">Lifetime spend (paid)</p>
          <p className="mt-1 font-tag text-xl font-semibold text-forest-600">{formatCurrency(customer.stats.totalSpent)}</p>
        </div>
      </div>

      <section>
        <h2 className="font-display text-lg font-700 text-ink-900">Recent orders</h2>
        {!customer.recentOrders.length && <p className="mt-2 text-sm text-ash">No orders yet.</p>}
        <ul className="mt-3 space-y-2">
          {customer.recentOrders.map((order) => (
            <li key={order.orderNumber} className="flex items-center justify-between rounded-xl border border-ink-50 bg-white p-3 text-sm">
              <span className="font-tag font-semibold text-ink-900">{order.orderNumber}</span>
              <span className="font-tag">{formatCurrency(order.total)}</span>
              <StatusBadge status={order.status} />
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
