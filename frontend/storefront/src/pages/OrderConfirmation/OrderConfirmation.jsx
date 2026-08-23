import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import Spinner from '../../components/common/Spinner.jsx';
import ErrorState from '../../components/common/ErrorState.jsx';
import StatusBadge from '../../components/common/StatusBadge.jsx';
import Button from '../../components/common/Button.jsx';
import { formatCurrency } from '../../utils/formatCurrency.js';
import * as orderApi from '../../api/orderApi.js';

export default function OrderConfirmation() {
  const { orderNumber } = useParams();

  const orderQuery = useQuery({
    queryKey: ['order', orderNumber],
    queryFn: () => orderApi.getOrderDetail(orderNumber),
  });

  if (orderQuery.isLoading) return <Spinner label="Loading your order" />;

  if (orderQuery.isError) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-16 sm:px-6">
        <ErrorState message={orderQuery.error?.message} onRetry={orderQuery.refetch} />
      </div>
    );
  }

  const order = orderQuery.data;

  return (
    <div className="mx-auto max-w-2xl px-4 py-16 sm:px-6">
      <p className="font-tag text-xs uppercase tracking-wide text-gold-700">Order placed</p>
      <h1 className="mt-2 font-display text-3xl font-800 text-cream">Thank you!</h1>
      <p className="mt-2 text-ink-100">
        Your order <span className="font-tag text-cream">{order.orderNumber}</span> has been
        placed{order.paymentMethod === 'pay_on_delivery' ? ' and will be paid on delivery.' : '.'}
      </p>

      <div className="mt-8 rounded-xl border border-ink-600 bg-ink-600 p-5">
        <div className="flex items-center justify-between">
          <span className="text-sm text-ink-100">Status</span>
          <StatusBadge status={order.status} />
        </div>
        <ul className="mt-4 space-y-1 text-sm text-ink-100">
          {order.items.map((item) => (
            <li key={item.productId} className="flex justify-between">
              <span>
                {item.name} × {item.quantity}
              </span>
              <span className="font-tag">{formatCurrency(item.lineTotal)}</span>
            </li>
          ))}
        </ul>
        <div className="mt-4 space-y-1 border-t border-ink-600 pt-3 text-sm">
          <div className="flex justify-between text-ink-100">
            <span>Subtotal</span>
            <span className="font-tag text-cream">{formatCurrency(order.subtotal)}</span>
          </div>
          <div className="flex justify-between text-ink-100">
            <span>Delivery fee</span>
            <span className="font-tag text-cream">{formatCurrency(order.deliveryFee)}</span>
          </div>
          <div className="flex justify-between pt-2 text-base font-semibold text-cream">
            <span>Total</span>
            <span className="font-tag">{formatCurrency(order.total)}</span>
          </div>
        </div>
        {order.deliveryZone?.estimatedDays && (
          <p className="mt-3 text-xs text-ink-100">
            Estimated delivery to {order.deliveryZone.cityName}: {order.deliveryZone.estimatedDays}
          </p>
        )}
      </div>

      <div className="mt-6 flex gap-3">
        <Button as={Link} to={`/orders/${order.orderNumber}`}>
          Track this order
        </Button>
        <Button variant="outline" as={Link} to="/products">
          Continue shopping
        </Button>
      </div>
    </div>
  );
}
