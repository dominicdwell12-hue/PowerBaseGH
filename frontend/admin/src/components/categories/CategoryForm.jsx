import { useState } from 'react';
import FormField, { inputClass } from '../common/FormField.jsx';
import Button from '../common/Button.jsx';

export default function CategoryForm({ categories, initialValues, onSubmit, onCancel, isSubmitting }) {
  const [form, setForm] = useState({
    name: initialValues?.name ?? '',
    parentId: initialValues?.parentId ?? '',
    imageUrl: initialValues?.imageUrl ?? '',
  });
  const [error, setError] = useState(null);

  function set(field) {
    return (e) => setForm((prev) => ({ ...prev, [field]: e.target.value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);
    try {
      await onSubmit({
        name: form.name,
        parentId: form.parentId ? Number(form.parentId) : undefined,
        imageUrl: form.imageUrl || undefined,
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
      <FormField label="Image URL (optional)" htmlFor="catImage">
        <input
          id="catImage"
          type="url"
          placeholder="https://…"
          className={inputClass}
          value={form.imageUrl}
          onChange={set('imageUrl')}
        />
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
