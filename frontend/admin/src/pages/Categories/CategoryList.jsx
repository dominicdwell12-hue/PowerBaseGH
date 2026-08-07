import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import DataTable from '../../components/common/DataTable.jsx';
import Modal from '../../components/common/Modal.jsx';
import Button from '../../components/common/Button.jsx';
import { TableSkeleton } from '../../components/common/Skeleton.jsx';
import ErrorState from '../../components/common/ErrorState.jsx';
import CategoryForm from '../../components/categories/CategoryForm.jsx';
import * as categoryApi from '../../api/categoryApi.js';

export default function CategoryList() {
  const queryClient = useQueryClient();
  const [modalState, setModalState] = useState(null); // null | 'new' | category object
  const [actionError, setActionError] = useState(null);

  const categoriesQuery = useQuery({ queryKey: ['adminCategories'], queryFn: categoryApi.listCategories });

  const saveMutation = useMutation({
    mutationFn: ({ id, payload }) => (id ? categoryApi.updateCategory(id, payload) : categoryApi.createCategory(payload)),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminCategories'] });
      setModalState(null);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: categoryApi.deleteCategory,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['adminCategories'] }),
    onError: (err) => setActionError(err?.message ?? 'Could not delete this category.'),
  });

  if (categoriesQuery.isLoading) return <TableSkeleton />;

  if (categoriesQuery.isError) {
    return <ErrorState message={categoriesQuery.error?.message} onRetry={categoriesQuery.refetch} />;
  }

  const categories = categoriesQuery.data;
  const categoryById = new Map(categories.map((c) => [c.id, c]));

  const columns = [
    { key: 'name', header: 'Name' },
    {
      key: 'parent',
      header: 'Parent',
      render: (row) => (row.parentId ? categoryById.get(row.parentId)?.name ?? '—' : '—'),
    },
    { key: 'products', header: 'Products', render: (row) => row._count?.products ?? 0 },
    {
      key: 'actions',
      header: '',
      className: 'text-right',
      render: (row) => (
        <div className="flex justify-end gap-3">
          <button type="button" className="text-sm font-medium text-gold-700 hover:underline" onClick={() => setModalState(row)}>
            Edit
          </button>
          <button
            type="button"
            className="text-sm font-medium text-brick-600 hover:underline"
            onClick={() => {
              setActionError(null);
              deleteMutation.mutate(row.id);
            }}
          >
            Delete
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-2xl font-800 text-ink-900">Categories</h1>
        <Button onClick={() => setModalState('new')}>+ Add category</Button>
      </div>

      {actionError && <p className="text-sm text-brick-600">{actionError}</p>}

      <DataTable columns={columns} rows={categories} emptyMessage="No categories yet." />

      {modalState && (
        <Modal title={modalState === 'new' ? 'Add category' : 'Edit category'} onClose={() => setModalState(null)}>
          <CategoryForm
            categories={categories}
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
