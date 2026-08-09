import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import DataTable from '../../components/common/DataTable.jsx';
import Modal from '../../components/common/Modal.jsx';
import Button from '../../components/common/Button.jsx';
import Pagination from '../../components/common/Pagination.jsx';
import { TableSkeleton } from '../../components/common/Skeleton.jsx';
import ErrorState from '../../components/common/ErrorState.jsx';
import ProductForm from '../../components/products/ProductForm.jsx';
import { formatCurrency } from '../../utils/formatCurrency.js';
import * as productApi from '../../api/productApi.js';
import * as categoryApi from '../../api/categoryApi.js';
import axiosClient from '../../api/axiosClient.js';

// The admin list endpoint only includes each product's primary image
// (see product.service.js::adminListProducts). There's no dedicated
// admin get-by-id route, so the full image set for the edit modal comes
// from the public product-detail endpoint instead, which already returns
// every image — it needs no auth and every product here has a slug.
async function fetchFullProduct(slug) {
  const { data } = await axiosClient.get(`/products/${slug}`);
  return data.data.product;
}

export default function ProductList() {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('all');
  const [modalState, setModalState] = useState(null); // null | 'new' | product

  const categoriesQuery = useQuery({ queryKey: ['adminCategories'], queryFn: categoryApi.listCategories });

  const productsQuery = useQuery({
    queryKey: ['adminProducts', { page, search, status }],
    queryFn: () => productApi.listProducts({ page, limit: 15, search: search || undefined, status }),
    placeholderData: (prev) => prev,
  });

  function invalidateProducts() {
    queryClient.invalidateQueries({ queryKey: ['adminProducts'] });
  }

  const saveMutation = useMutation({
    mutationFn: ({ id, payload }) => (id ? productApi.updateProduct(id, payload) : productApi.createProduct(payload)),
    onSuccess: (product) => {
      invalidateProducts();
      // Keep editing the same product (now with its id) so images can be
      // managed right after creation, instead of closing the modal.
      setModalState(product);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: productApi.deleteProduct,
    onSuccess: invalidateProducts,
  });

  const stockMutation = useMutation({
    mutationFn: ({ id, stockQuantity }) => productApi.updateStock(id, stockQuantity),
    onSuccess: invalidateProducts,
  });

  const uploadImagesMutation = useMutation({
    mutationFn: ({ id, files }) => productApi.uploadImages(id, files),
    onSuccess: (newImages) => {
      invalidateProducts();
      setModalState((prev) => (prev && prev !== 'new' ? { ...prev, images: [...(prev.images ?? []), ...newImages] } : prev));
    },
  });

  const deleteImageMutation = useMutation({
    mutationFn: ({ productId, imageId }) => productApi.deleteImage(productId, imageId),
    onSuccess: (_result, variables) => {
      invalidateProducts();
      setModalState((prev) =>
        prev && prev !== 'new'
          ? { ...prev, images: prev.images.filter((img) => img.id !== variables.imageId) }
          : prev
      );
    },
  });

  const setPrimaryImageMutation = useMutation({
    mutationFn: ({ productId, imageId }) => productApi.setPrimaryImage(productId, imageId),
    onSuccess: (_result, variables) => {
      invalidateProducts();
      setModalState((prev) =>
        prev && prev !== 'new'
          ? { ...prev, images: prev.images.map((img) => ({ ...img, isPrimary: img.id === variables.imageId })) }
          : prev
      );
    },
  });

  const editingProduct = modalState && modalState !== 'new' ? modalState : null;
  const fullProductQuery = useQuery({
    queryKey: ['adminProductImages', editingProduct?.slug],
    queryFn: () => fetchFullProduct(editingProduct.slug),
    enabled: Boolean(editingProduct),
    retry: false,
  });

  if (productsQuery.isLoading || categoriesQuery.isLoading) return <TableSkeleton columns={6} />;

  if (productsQuery.isError) {
    return <ErrorState message={productsQuery.error?.message} onRetry={productsQuery.refetch} />;
  }

  const { items, pagination } = productsQuery.data;

  const columns = [
    { key: 'name', header: 'Product' },
    { key: 'sku', header: 'SKU' },
    { key: 'category', header: 'Category', render: (row) => row.category?.name ?? '—' },
    {
      key: 'price',
      header: 'Price',
      render: (row) => (
        <span className="font-tag">
          {formatCurrency(row.discountPrice ?? row.price)}
          {row.discountPrice && <span className="ml-1 text-ash line-through">{formatCurrency(row.price)}</span>}
        </span>
      ),
    },
    {
      key: 'stock',
      header: 'Stock',
      render: (row) => (
        <input
          type="number"
          min="0"
          defaultValue={row.stockQuantity}
          onBlur={(e) => {
            const value = Number(e.target.value);
            if (value !== row.stockQuantity) stockMutation.mutate({ id: row.id, stockQuantity: value });
          }}
          className="w-20 rounded-lg border border-ink-100 px-2 py-1 text-sm"
        />
      ),
    },
    {
      key: 'status',
      header: 'Status',
      render: (row) => (
        <span className={row.isActive ? 'text-forest-600' : 'text-brick-600'}>
          {row.isActive ? 'Active' : 'Inactive'}
        </span>
      ),
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
          <button
            type="button"
            className="text-sm font-medium text-brick-600 hover:underline"
            onClick={() => deleteMutation.mutate(row.id)}
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
        <h1 className="font-display text-2xl font-800 text-ink-900">Products</h1>
        <Button onClick={() => setModalState('new')}>+ Add product</Button>
      </div>

      <div className="flex flex-wrap gap-3">
        <input
          type="search"
          placeholder="Search by name or SKU"
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

      <DataTable columns={columns} rows={items} emptyMessage="No products match these filters." />
      <Pagination page={pagination.page} totalPages={pagination.totalPages} onChange={setPage} />

      {modalState && (
        <Modal title={modalState === 'new' ? 'Add product' : 'Edit product'} onClose={() => setModalState(null)} wide>
          <ProductForm
            categories={categoriesQuery.data}
            initialValues={
              modalState === 'new'
                ? null
                : { ...modalState, images: fullProductQuery.data?.images ?? modalState.images }
            }
            isSubmitting={saveMutation.isPending}
            onSubmit={(payload) => saveMutation.mutateAsync({ id: modalState === 'new' ? null : modalState.id, payload })}
            onCancel={() => setModalState(null)}
            onUploadImages={
              modalState !== 'new'
                ? (files) => uploadImagesMutation.mutateAsync({ id: modalState.id, files })
                : undefined
            }
            onDeleteImage={
              modalState !== 'new'
                ? (imageId) => deleteImageMutation.mutateAsync({ productId: modalState.id, imageId })
                : undefined
            }
            onSetPrimaryImage={
              modalState !== 'new'
                ? (imageId) => setPrimaryImageMutation.mutateAsync({ productId: modalState.id, imageId })
                : undefined
            }
          />
        </Modal>
      )}
    </div>
  );
}
