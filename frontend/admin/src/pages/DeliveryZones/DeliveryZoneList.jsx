import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import DataTable from '../../components/common/DataTable.jsx';
import Modal from '../../components/common/Modal.jsx';
import Button from '../../components/common/Button.jsx';
import { TableSkeleton } from '../../components/common/Skeleton.jsx';
import ErrorState from '../../components/common/ErrorState.jsx';
import DeliveryZoneForm from '../../components/deliveryZones/DeliveryZoneForm.jsx';
import { formatCurrency } from '../../utils/formatCurrency.js';
import * as deliveryApi from '../../api/deliveryApi.js';

export default function DeliveryZoneList() {
  const queryClient = useQueryClient();
  const [modalState, setModalState] = useState(null); // null | 'new' | zone
  const [statusFilter, setStatusFilter] = useState('all');

  const zonesQuery = useQuery({
    queryKey: ['adminZones', statusFilter],
    queryFn: () => deliveryApi.listZones(statusFilter),
  });

  function invalidate() {
    queryClient.invalidateQueries({ queryKey: ['adminZones'] });
  }

  const saveMutation = useMutation({
    mutationFn: ({ id, payload }) => (id ? deliveryApi.updateZone(id, payload) : deliveryApi.createZone(payload)),
    onSuccess: () => {
      invalidate();
      setModalState(null);
    },
  });

  const deactivateMutation = useMutation({
    mutationFn: deliveryApi.deactivateZone,
    onSuccess: invalidate,
  });

  if (zonesQuery.isLoading) return <TableSkeleton />;
  if (zonesQuery.isError) return <ErrorState message={zonesQuery.error?.message} onRetry={zonesQuery.refetch} />;

  const zones = zonesQuery.data;

  const columns = [
    { key: 'cityName', header: 'City' },
    { key: 'region', header: 'Region', render: (row) => row.region ?? '—' },
    { key: 'deliveryFee', header: 'Fee', render: (row) => <span className="font-tag">{formatCurrency(row.deliveryFee)}</span> },
    { key: 'estimatedDays', header: 'ETA', render: (row) => row.estimatedDays ?? '—' },
    {
      key: 'pod',
      header: 'Pay on Delivery',
      render: (row) => (
        <span className={row.payOnDeliveryEnabled ? 'text-forest-600' : 'text-ash'}>
          {row.payOnDeliveryEnabled ? 'Enabled' : 'Not available'}
        </span>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      render: (row) => <span className={row.isActive ? 'text-forest-600' : 'text-brick-600'}>{row.isActive ? 'Active' : 'Inactive'}</span>,
    },
    {
      key: 'actions',
      header: '',
      className: 'text-right',
      render: (row) => (
        <div className="flex justify-end gap-3">
          <button type="button" className="text-sm font-medium text-gold-700 hover:underline" onClick={() => setModalState(row)}>
            Edit
          </button>
          {row.isActive && (
            <button
              type="button"
              className="text-sm font-medium text-brick-600 hover:underline"
              onClick={() => deactivateMutation.mutate(row.id)}
            >
              Deactivate
            </button>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-2xl font-800 text-ink-900">Delivery zones</h1>
        <Button onClick={() => setModalState('new')}>+ Add zone</Button>
      </div>

      <select
        value={statusFilter}
        onChange={(e) => setStatusFilter(e.target.value)}
        className="rounded-lg border border-ink-100 px-3 py-2 text-sm"
      >
        <option value="all">All statuses</option>
        <option value="active">Active</option>
        <option value="inactive">Inactive</option>
      </select>

      <DataTable columns={columns} rows={zones} emptyMessage="No delivery zones yet." />

      {modalState && (
        <Modal title={modalState === 'new' ? 'Add delivery zone' : 'Edit delivery zone'} onClose={() => setModalState(null)}>
          <DeliveryZoneForm
            initialValues={modalState === 'new' ? null : modalState}
            isSubmitting={saveMutation.isPending}
            onSubmit={(payload) => saveMutation.mutateAsync({ id: modalState === 'new' ? null : modalState.id, payload })}
            onCancel={() => setModalState(null)}
          />
        </Modal>
      )}
    </div>
  );
}
