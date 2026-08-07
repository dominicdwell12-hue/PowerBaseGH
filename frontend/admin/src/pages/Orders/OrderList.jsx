import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import DataTable from '../../components/common/DataTable.jsx';
import StatusBadge from '../../components/common/StatusBadge.jsx';
import Pagination from '../../components/common/Pagination.jsx';
import { TableSkeleton } from '../../components/common/Skeleton.jsx';
import ErrorState from '../../components/common/ErrorState.jsx';
import { formatCurrency } from '../../utils/formatCurrency.js';
import { ORDER_STATUSES } from '../../utils/constants.js';
import * as orderApi from '../../api/orderApi.js';

const PAYMENT_STATUSES = ['pending', 'paid', 'failed', 'refunded'];

export default function OrderList() {
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState('');
  const [paymentStatus, setPaymentStatus] = useState('');
  const [search, setSearch] = useState('');

  const ordersQuery = useQuery({
    queryKey: ['adminOrders', { page, status, paymentStatus, search }],
    queryFn: () =>
      orderApi.listOrders({
        page,
        limit: 15,
        status: status || undefined,
        paymentStatus: paymentStatus || undefined,
        search: search || undefined,
      }),
    placeholderData: (prev) => prev,
  });

  if (ordersQuery.isLoading) return <TableSkeleton />;
  if (ordersQuery.isError) return <ErrorState message={ordersQuery.error?.message} onRetry={ordersQuery.refetch} />;

  const { orders, pagination } = ordersQuery.data;

  const columns = [
    {
      key: 'orderNumber',
      header: 'Order',
      render: (row) => (
        <Link to={`/orders/${row.orderNumber}`} className="font-tag font-semibold text-gold-700 hover:underline">
          {row.orderNumber}
        </Link>
      ),
    },
    { key: 'customer', header: 'Customer', render: (row) => row.customer?.name ?? '—' },
    { key: 'total', header: 'Total', render: (row) => <span className="font-tag">{formatCurrency(row.total)}</span> },
    { key: 'paymentStatus', header: 'Payment', render: (row) => row.paymentStatus },
    { key: 'status', header: 'Status', render: (row) => <StatusBadge status={row.status} /> },
    {
      key: 'createdAt',
      header: 'Date',
      render: (row) => new Date(row.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' }),
    },
  ];

  return (
    <div className="space-y-4">
      <h1 className="font-display text-2xl font-800 text-ink-900">Orders</h1>

      <div className="flex flex-wrap gap-3">
        <input
          type="search"
          placeholder="Search order number or customer"
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
          }}
          className="rounded-lg border border-ink-100 px-3 py-2 text-sm"
        />
        <select
          value={status}
          onChange={(e) => {
            setStatus(e.target.value);
            setPage(1);
          }}
          className="rounded-lg border border-ink-100 px-3 py-2 text-sm"
        >
          <option value="">All statuses</option>
          {ORDER_STATUSES.concat('Cancelled').map((s) => (
            <option key={s} value={s}>
              {s.replace(/_/g, ' ')}
            </option>
          ))}
        </select>
        <select
          value={paymentStatus}
          onChange={(e) => {
            setPaymentStatus(e.target.value);
            setPage(1);
          }}
          className="rounded-lg border border-ink-100 px-3 py-2 text-sm"
        >
          <option value="">All payment statuses</option>
          {PAYMENT_STATUSES.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
      </div>

      <DataTable columns={columns} rows={orders} getRowKey={(row) => row.orderNumber} emptyMessage="No orders match these filters." />
      <Pagination page={pagination.page} totalPages={pagination.totalPages} onChange={setPage} />
    </div>
  );
}
