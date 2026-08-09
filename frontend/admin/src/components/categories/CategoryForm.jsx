import { useEffect, useRef, useState } from 'react';
import FormField, { inputClass } from '../common/FormField.jsx';
import Button from '../common/Button.jsx';

const ACCEPTED_IMAGE_TYPES = 'image/jpeg,image/png,image/webp';

export default function CategoryForm({ categories, initialValues, onSubmit, onCancel, isSubmitting }) {
  const [form, setForm] = useState({
    name: initialValues?.name ?? '',
    parentId: initialValues?.parentId ?? '',
  });
  const [error, setError] = useState(null);
  const fileInputRef = useRef(null);

  // imageFile: the newly picked File (if any) to upload on save.
  // imagePreview: what to show — either the existing Cloudinary URL, or an
  // object URL for a freshly picked file, or null if there's no image.
  // removeImage: true once the admin removes an existing image without
  // picking a replacement, so we tell the backend to clear it on save.
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(initialValues?.imageUrl ?? null);
  const [removeImage, setRemoveImage] = useState(false);

  // Object URLs created for local previews need to be released when we're
  // done with them, otherwise they leak for the life of the page.
  useEffect(() => {
    return () => {
      if (imageFile && imagePreview) URL.revokeObjectURL(imagePreview);
    };
  }, [imageFile, imagePreview]);

  function set(field) {
    return (e) => setForm((prev) => ({ ...prev, [field]: e.target.value }));
  }

  function handleFileChange(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
    setRemoveImage(false);
  }

  function handleRemoveImage() {
    setImageFile(null);
    setImagePreview(null);
    setRemoveImage(true);
    if (fileInputRef.current) fileInputRef.current.value = '';
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);
    try {
      await onSubmit({
        name: form.name,
        parentId: form.parentId ? Number(form.parentId) : undefined,
        imageFile,
        removeImage,
      });
    } catch (err) {
      setError(err?.message ?? 'Could not save this category.');
    }
  }

  // A category can't be its own parent — filter it (and only it) out of
  // the options; the backend also rejects this, this just avoids the
  // round trip.
  const parentOptions = categories?.filter((c) => c.id !== initialValues?.id) ?? [];

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <FormField label="Name" htmlFor="catName">
        <input id="catName" required className={inputClass} value={form.name} onChange={set('name')} />
      </FormField>
      <FormField label="Parent category (optional)" htmlFor="catParent">
        <select id="catParent" className={inputClass} value={form.parentId} onChange={set('parentId')}>
          <option value="">None — top level</option>
          {parentOptions.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
      </FormField>
      <FormField label="Category Image" htmlFor="catImage">
        <input
          id="catImage"
          ref={fileInputRef}
          type="file"
          accept={ACCEPTED_IMAGE_TYPES}
          hidden
          onChange={handleFileChange}
        />
        {imagePreview ? (
          <div className="flex items-center gap-3">
            <img
              src={imagePreview}
              alt="Category preview"
              className="h-20 w-20 rounded-lg border border-ink-100 object-cover"
            />
            <div className="flex gap-2">
              <Button type="button" variant="outline" onClick={() => fileInputRef.current?.click()}>
                Change Image
              </Button>
              <Button type="button" variant="outline" onClick={handleRemoveImage}>
                Remove
              </Button>
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-3">
            <Button type="button" variant="outline" onClick={() => fileInputRef.current?.click()}>
              Choose Image
            </Button>
            <span className="text-sm text-ash">No image selected</span>
          </div>
        )}
      </FormField>

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
