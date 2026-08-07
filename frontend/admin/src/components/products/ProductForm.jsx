import { useState } from 'react';
import FormField, { inputClass } from '../common/FormField.jsx';
import Button from '../common/Button.jsx';

export default function ProductForm({
  categories,
  initialValues,
  onSubmit,
  onCancel,
  isSubmitting,
  onUploadImages,
  onDeleteImage,
  onSetPrimaryImage,
}) {
  const [form, setForm] = useState({
    name: initialValues?.name ?? '',
    categoryId: initialValues?.categoryId ?? initialValues?.category?.id ?? '',
    description: initialValues?.description ?? '',
    price: initialValues?.price ?? '',
    discountPrice: initialValues?.discountPrice ?? '',
    sku: initialValues?.sku ?? '',
    stockQuantity: initialValues?.stockQuantity ?? 0,
    brand: initialValues?.brand ?? '',
    isFeatured: initialValues?.isFeatured ?? false,
  });
  const [error, setError] = useState(null);
  const [isUploading, setIsUploading] = useState(false);

  function set(field) {
    return (e) => {
      const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
      setForm((prev) => ({ ...prev, [field]: value }));
    };
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);
    try {
      await onSubmit({
        name: form.name,
        categoryId: Number(form.categoryId),
        description: form.description,
        price: Number(form.price),
        discountPrice: form.discountPrice ? Number(form.discountPrice) : undefined,
        sku: form.sku,
        stockQuantity: Number(form.stockQuantity),
        brand: form.brand || undefined,
        isFeatured: form.isFeatured,
      });
    } catch (err) {
      setError(err?.message ?? 'Could not save this product.');
    }
  }

  async function handleFileChange(e) {
    if (!e.target.files?.length || !onUploadImages) return;
    setIsUploading(true);
    try {
      await onUploadImages(e.target.files);
    } finally {
      setIsUploading(false);
      e.target.value = '';
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div className="grid gap-3 sm:grid-cols-2">
        <FormField label="Name" htmlFor="p-name">
          <input id="p-name" required className={inputClass} value={form.name} onChange={set('name')} />
        </FormField>
        <FormField label="SKU" htmlFor="p-sku">
          <input id="p-sku" required className={inputClass} value={form.sku} onChange={set('sku')} />
        </FormField>
      </div>

      <FormField label="Category" htmlFor="p-category">
        <select id="p-category" required className={inputClass} value={form.categoryId} onChange={set('categoryId')}>
          <option value="" disabled>
            Select a category
          </option>
          {categories?.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
      </FormField>

      <FormField label="Description" htmlFor="p-desc">
        <textarea
          id="p-desc"
          required
          minLength={10}
          rows={3}
          className={inputClass}
          value={form.description}
          onChange={set('description')}
        />
      </FormField>

      <div className="grid gap-3 sm:grid-cols-3">
        <FormField label="Price (GHS)" htmlFor="p-price">
          <input id="p-price" type="number" min="0.01" step="0.01" required className={inputClass} value={form.price} onChange={set('price')} />
        </FormField>
        <FormField label="Discount price (optional)" htmlFor="p-discount">
          <input
            id="p-discount"
            type="number"
            min="0"
            step="0.01"
            className={inputClass}
            value={form.discountPrice}
            onChange={set('discountPrice')}
          />
        </FormField>
        <FormField label="Stock quantity" htmlFor="p-stock">
          <input
            id="p-stock"
            type="number"
            min="0"
            required
            className={inputClass}
            value={form.stockQuantity}
            onChange={set('stockQuantity')}
          />
        </FormField>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <FormField label="Brand (optional)" htmlFor="p-brand">
          <input id="p-brand" className={inputClass} value={form.brand} onChange={set('brand')} />
        </FormField>
        <label className="mt-6 flex items-center gap-2 text-sm text-ink-900">
          <input type="checkbox" checked={form.isFeatured} onChange={set('isFeatured')} />
          Feature on homepage
        </label>
      </div>

      {initialValues?.id && (
        <div>
          <p className="text-sm font-medium text-ink-900">Images</p>
          <div className="mt-2 flex flex-wrap gap-2">
            {initialValues.images?.map((img) => (
              <div key={img.id} className="relative h-16 w-16 overflow-hidden rounded-lg border border-ink-100">
                <img src={img.imageUrl} alt="" loading="lazy" className="h-full w-full object-cover" />
                {img.isPrimary ? (
                  <span className="absolute bottom-0 left-0 right-0 bg-gold text-center text-[10px] font-semibold text-ink-900">
                    Primary
                  </span>
                ) : (
                  <button
                    type="button"
                    onClick={() => onSetPrimaryImage(img.id)}
                    className="absolute bottom-0 left-0 right-0 bg-ink-900/60 text-center text-[10px] text-paper"
                  >
                    Set primary
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => onDeleteImage(img.id)}
                  aria-label="Remove image"
                  className="absolute right-0 top-0 rounded-bl bg-brick px-1 text-[10px] text-paper"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
          <label className="mt-2 inline-block cursor-pointer text-sm font-medium text-gold-700 hover:underline">
            {isUploading ? 'Uploading…' : '+ Upload images'}
            <input type="file" accept="image/*" multiple hidden onChange={handleFileChange} disabled={isUploading} />
          </label>
        </div>
      )}

      {error && <p className="text-sm text-brick-600">{error}</p>}

      <div className="flex gap-2 pt-1">
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Saving…' : 'Save'}
        </Button>
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
      </div>
    </form>
  );
}
