import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import Spinner from '../../components/common/Spinner.jsx';
import ErrorState from '../../components/common/ErrorState.jsx';
import StatusBadge from '../../components/common/StatusBadge.jsx';
import Button from '../../components/common/Button.jsx';
import { formatCurrency } from '../../utils/formatCurrency.js';
import { ORDER_STATUS_TRANSITIONS } from '../../utils/constants.js';
import * as orderApi from '../../api/orderApi.js';

export default function OrderDetail() {
  const { orderNumber } = useParams();
  const queryClient = useQueryClient();
  const [nextStatus, setNextStatus] = useState('');
  const [note, setNote] = useState('');
  const [error, setError] = useState(null);

  const orderQuery = useQuery({
    queryKey: ['adminOrder', orderNumber],
    queryFn: () => orderApi.getOrderDetail(orderNumber),
  });

  const statusMutation = useMutation({
    mutationFn: (payload) => orderApi.updateOrderStatus(orderNumber, payload),
    onSuccess: (updated) => {
      queryClient.setQueryData(['adminOrder', orderNumber], updated);
      queryClient.invalidateQueries({ queryKey: ['adminOrders'] });
      setNextStatus('');
      setNote('');
      setError(null);
    },
    onError: (err) => setError(err?.message ?? 'Could not update order status.'),
  });

  if (orderQuery.isLoading) return <Spinner label="Loading order" />;
  if (orderQuery.isError) return <ErrorState message={orderQuery.error?.message} onRetry={orderQuery.refetch} />;

  const order = orderQuery.data;
  const allowedNext = ORDER_STATUS_TRANSITIONS[order.status] ?? [];

  return (
    <div className="max-w-3xl space-y-6">
      <div>
        <Link to="/orders" className="text-sm text-gold-700 hover:underline">
          ← All orders
        </Link>
        <div className="mt-1 flex items-center justify-between">
          <h1 className="font-display text-2xl font-800 text-ink-900">{order.orderNumber}</h1>
          <StatusBadge status={order.status} />
        </div>
      </div>

      <div className="grid gap-6 sm:grid-cols-2">
        <section className="rounded-xl border border-ink-50 bg-white p-4">
          <h2 className="font-display text-sm font-700 text-ink-900">Customer</h2>
          <p className="mt-2 text-sm text-ash">
            {order.customer?.name}
            <br />
            {order.customer?.email} · {order.customer?.phone}
          </p>
        </section>
        <section className="rounded-xl border border-ink-50 bg-white p-4">
          <h2 className="font-display text-sm font-700 text-ink-900">Delivery address</h2>
          <p className="mt-2 text-sm text-ash">
            {order.address?.recipientName} · {order.address?.phone}
            <br />
            {order.address?.street}
            {order.address?.landmark ? `, ${order.address.landmark}` : ''}
            <br />
            {order.deliveryZone?.cityName}
            {order.deliveryZone?.estimatedDays ? ` · ETA ${order.deliveryZone.estimatedDays}` : ''}
          </p>
        </section>
      </div>

      <section className="rounded-xl border border-ink-50 bg-white p-4">
        <h2 className="font-display text-sm font-700 text-ink-900">Items</h2>
        <ul className="mt-2 space-y-1 text-sm text-ash">
          {order.items.map((item) => (
            <li key={item.productId} className="flex justify-between">
              <span>
                {item.name} × {item.quantity}
              </span>
              <span className="font-tag">{formatCurrency(item.lineTotal)}</span>
            </li>
          ))}
        </ul>
        <div className="mt-3 space-y-1 border-t border-ink-50 pt-3 text-sm">
          <div className="flex justify-between text-ash">
            <span>Subtotal</span>
            <span className="font-tag text-ink-900">{formatCurrency(order.subtotal)}</span>
          </div>
          <div className="flex justify-between text-ash">
            <span>Delivery fee</span>
            <span className="font-tag text-ink-900">{formatCurrency(order.deliveryFee)}</span>
          </div>
          <div className="flex justify-between text-base font-semibold text-ink-900">
            <span>Total</span>
            <span className="font-tag">{formatCurrency(order.total)}</span>
          </div>
        </div>
        <p className="mt-2 text-xs text-ash">
          Payment: {order.paymentMethod.replace(/_/g, ' ')} · {order.paymentStatus}
        </p>
      </section>

      <section className="rounded-xl border border-ink-50 bg-white p-4">
        <h2 className="font-display text-sm font-700 text-ink-900">Payment</h2>
        {order.payments?.length ? (
          <ul className="mt-2 space-y-3 text-sm text-ash">
            {order.payments.map((p) => (
              <li key={p.reference} className="border-t border-ink-50 pt-3 first:border-0 first:pt-0">
                <div className="flex justify-between">
                  <span className="font-medium text-ink-900 capitalize">{p.provider}</span>
                  <StatusBadge status={p.status} />
                </div>
                <p className="mt-1">
                  Ref: <span className="font-tag">{p.reference}</span>
                  {p.method ? ` · ${p.method.replace(/_/g, ' ')}` : ''}
                </p>
                <p className="mt-1 flex justify-between">
                  <span>{formatCurrency(p.amount)} {p.currency}</span>
                  <span>
                    {p.paidAt
                      ? `Paid ${new Date(p.paidAt).toLocaleString('en-GB', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}`
                      : 'Not yet paid'}
                  </span>
                </p>
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-2 text-sm text-ash">No payment attempts recorded for this order yet.</p>
        )}
      </section>

      <section className="rounded-xl border border-ink-50 bg-white p-4">
        <h2 className="font-display text-sm font-700 text-ink-900">Status history</h2>
        <ul className="mt-2 space-y-1 text-sm text-ash">
          {order.statusHistory.map((h, i) => (
            // eslint-disable-next-line react/no-array-index-key
            <li key={i}>
              <span className="font-medium text-ink-900">{h.status.replace(/_/g, ' ')}</span> —{' '}
              {new Date(h.createdAt).toLocaleString('en-GB', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
              {h.note ? ` · ${h.note}` : ''}
            </li>
          ))}
        </ul>

        {allowedNext.length > 0 ? (
          <div className="mt-4 flex flex-wrap items-end gap-2 border-t border-ink-50 pt-4">
            <label className="flex flex-col text-sm">
              Next status
              <select
                value={nextStatus}
                onChange={(e) => setNextStatus(e.target.value)}
                className="mt-1 rounded-lg border border-ink-100 px-2 py-1.5"
              >
                <option value="" disabled>
                  Choose…
                </option>
                {allowedNext.map((s) => (
                  <option key={s} value={s}>
                    {s.replace(/_/g, ' ')}
                  </option>
                ))}
              </select>
            </label>
            <label className="flex flex-1 flex-col text-sm">
              Note (optional)
              <input
                value={note}
                onChange={(e) => setNote(e.target.value)}
                className="mt-1 rounded-lg border border-ink-100 px-2 py-1.5"
              />
            </label>
            <Button
              disabled={!nextStatus || statusMutation.isPending}
              onClick={() => statusMutation.mutate({ status: nextStatus, note: note || undefined })}
            >
              {statusMutation.isPending ? 'Updating…' : 'Update status'}
            </Button>
          </div>
        ) : (
          <p className="mt-3 text-sm text-ash">This order is in a final state and can't be updated further.</p>
        )}

        {error && <p className="mt-2 text-sm text-brick-600">{error}</p>}
      </section>
    </div>
  );
}
