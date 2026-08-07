import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import Spinner from '../../components/common/Spinner.jsx';
import ErrorState from '../../components/common/ErrorState.jsx';
import StatusBadge from '../../components/common/StatusBadge.jsx';
import { ORDER_STATUSES } from '../../utils/constants.js';
import * as orderApi from '../../api/orderApi.js';

export default function OrderTracking() {
  const { orderNumber } = useParams();

  const trackingQuery = useQuery({
    queryKey: ['orderTracking', orderNumber],
    queryFn: () => orderApi.getOrderTracking(orderNumber),
  });

  if (trackingQuery.isLoading) return <Spinner label="Loading tracking" />;

  if (trackingQuery.isError) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-16 sm:px-6">
        <ErrorState message={trackingQuery.error?.message} onRetry={trackingQuery.refetch} />
      </div>
    );
  }

  const tracking = trackingQuery.data;
  const isCancelled = tracking.status === 'Cancelled';
  const reachedIndex = ORDER_STATUSES.indexOf(tracking.status);

  return (
    <div className="mx-auto max-w-2xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-2xl font-800 text-ink-900">
          Order {tracking.orderNumber}
        </h1>
        <StatusBadge status={tracking.status} />
      </div>

      {isCancelled ? (
        <div className="mt-8 rounded-xl border border-brick-50 bg-brick-50/30 p-5">
          <p className="font-semibold text-brick-600">This order was cancelled.</p>
          {tracking.statusHistory.at(-1)?.note && (
            <p className="mt-1 text-sm text-ash">{tracking.statusHistory.at(-1).note}</p>
          )}
        </div>
      ) : (
        <ol className="mt-8 space-y-6 border-l-2 border-ink-50 pl-6">
          {ORDER_STATUSES.map((status, index) => {
            const historyEntry = tracking.statusHistory.find((h) => h.status === status);
            const reached = index <= reachedIndex;

            return (
              <li key={status} className="relative">
                <span
                  className={`absolute -left-[1.85rem] top-1 h-3 w-3 rounded-full ${
                    reached ? 'bg-gold' : 'bg-ink-50'
                  }`}
                />
                <p className={`font-body text-sm font-semibold ${reached ? 'text-ink-900' : 'text-ash'}`}>
                  {status.replace(/_/g, ' ')}
                </p>
                {historyEntry && (
                  <p className="mt-0.5 text-xs text-ash">
                    {new Date(historyEntry.createdAt).toLocaleString('en-GB', {
                      day: 'numeric',
                      month: 'short',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                    {historyEntry.note ? ` · ${historyEntry.note}` : ''}
                  </p>
                )}
              </li>
            );
          })}
        </ol>
      )}
    </div>
  );
}
