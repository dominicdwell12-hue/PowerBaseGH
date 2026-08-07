import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import DataTable from '../../components/common/DataTable.jsx';
import Pagination from '../../components/common/Pagination.jsx';
import { TableSkeleton } from '../../components/common/Skeleton.jsx';
import ErrorState from '../../components/common/ErrorState.jsx';
import * as customerApi from '../../api/customerApi.js';

export default function CustomerList() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('all');

  const customersQuery = useQuery({
    queryKey: ['adminCustomers', { page, search, status }],
    queryFn: () => customerApi.listCustomers({ page, limit: 15, search: search || undefined, status }),
    placeholderData: (prev) => prev,
  });

  if (customersQuery.isLoading) return <TableSkeleton />;
  if (customersQuery.isError) return <ErrorState message={customersQuery.error?.message} onRetry={customersQuery.refetch} />;

  const { customers, pagination } = customersQuery.data;

  const columns = [
    {
      key: 'name',
      header: 'Name',
      render: (row) => (
        <Link to={`/customers/${row.id}`} className="font-medium text-gold-700 hover:underline">
          {row.name}
        </Link>
      ),
    },
    { key: 'email', header: 'Email' },
    { key: 'phone', header: 'Phone' },
    { key: 'orderCount', header: 'Orders' },
    {
      key: 'status',
      header: 'Status',
      render: (row) => <span className={row.isActive ? 'text-forest-600' : 'text-brick-600'}>{row.isActive ? 'Active' : 'Inactive'}</span>,
    },
  ];

  return (
    <div className="space-y-4">
      <h1 className="font-display text-2xl font-800 text-ink-900">Customers</h1>

      <div className="flex flex-wrap gap-3">
        <input
          type="search"
          placeholder="Search by name, email, or phone"
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
          <option value="all">All statuses</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </select>
      </div>

      <DataTable columns={columns} rows={customers} emptyMessage="No customers match these filters." />
      <Pagination page={pagination.page} totalPages={pagination.totalPages} onChange={setPage} />
    </div>
  );
}
