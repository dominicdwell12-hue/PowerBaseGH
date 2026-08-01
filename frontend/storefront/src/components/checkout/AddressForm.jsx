import { useState } from 'react';
import FormField, { inputClass } from '../common/FormField.jsx';
import Button from '../common/Button.jsx';

export default function AddressForm({ zones, onSubmit, onCancel, isSubmitting, initialValues }) {
  const [form, setForm] = useState({
    label: initialValues?.label ?? '',
    recipientName: initialValues?.recipientName ?? '',
    phone: initialValues?.phone ?? '',
    cityId: initialValues?.city?.id ?? '',
    street: initialValues?.street ?? '',
    landmark: initialValues?.landmark ?? '',
    isDefault: initialValues?.isDefault ?? false,
  });
  const [error, setError] = useState(null);

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
      await onSubmit({ ...form, cityId: Number(form.cityId) });
    } catch (err) {
      setError(err?.message ?? 'Could not save this address.');
    }
  }

  return (
    <form onSubmit={handleSubmit} className="mt-4 space-y-3 rounded-xl border border-ink-50 bg-white p-4">
      <div className="grid gap-3 sm:grid-cols-2">
        <FormField label="Recipient name" htmlFor="recipientName">
          <input
            id="recipientName"
            required
            className={inputClass}
            value={form.recipientName}
            onChange={set('recipientName')}
          />
        </FormField>
        <FormField label="Phone" htmlFor="phone">
          <input
            id="phone"
            required
            placeholder="0XXXXXXXXX"
            className={inputClass}
            value={form.phone}
            onChange={set('phone')}
          />
        </FormField>
      </div>

      <FormField label="Delivery city" htmlFor="cityId">
        <select id="cityId" required className={inputClass} value={form.cityId} onChange={set('cityId')}>
          <option value="" disabled>
            Select a city
          </option>
          {zones?.map((zone) => (
            <option key={zone.id} value={zone.id}>
              {zone.cityName}
              {zone.region ? ` (${zone.region})` : ''}
              {zone.payOnDeliveryEnabled ? ' — Pay on Delivery available' : ''}
            </option>
          ))}
        </select>
      </FormField>

      <FormField label="Street address" htmlFor="street">
        <input id="street" required className={inputClass} value={form.street} onChange={set('street')} />
      </FormField>

      <div className="grid gap-3 sm:grid-cols-2">
        <FormField label="Landmark (optional)" htmlFor="landmark">
          <input id="landmark" className={inputClass} value={form.landmark} onChange={set('landmark')} />
        </FormField>
        <FormField label="Label (optional)" htmlFor="label">
          <input
            id="label"
            placeholder="Home, Office…"
            className={inputClass}
            value={form.label}
            onChange={set('label')}
          />
        </FormField>
      </div>

      <label className="flex items-center gap-2 text-sm text-ink-900">
        <input type="checkbox" checked={form.isDefault} onChange={set('isDefault')} />
        Set as default address
      </label>

      {error && <p className="text-sm text-brick-600">{error}</p>}

      <div className="flex gap-2 pt-1">
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Saving…' : 'Save address'}
        </Button>
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
      </div>
    </form>
  );
}
