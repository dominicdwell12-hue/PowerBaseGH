import { useState } from 'react';
import FormField, { inputClass } from '../common/FormField.jsx';
import Button from '../common/Button.jsx';

export default function DeliveryZoneForm({ initialValues, onSubmit, onCancel, isSubmitting }) {
  const [form, setForm] = useState({
    cityName: initialValues?.cityName ?? '',
    region: initialValues?.region ?? '',
    payOnDeliveryEnabled: initialValues?.payOnDeliveryEnabled ?? false,
    deliveryFee: initialValues?.deliveryFee ?? '',
    estimatedDays: initialValues?.estimatedDays ?? '',
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
      await onSubmit({
        cityName: form.cityName,
        region: form.region || undefined,
        payOnDeliveryEnabled: form.payOnDeliveryEnabled,
        deliveryFee: Number(form.deliveryFee),
        estimatedDays: form.estimatedDays || undefined,
      });
    } catch (err) {
      setError(err?.message ?? 'Could not save this zone.');
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div className="grid gap-3 sm:grid-cols-2">
        <FormField label="City" htmlFor="z-city">
          <input id="z-city" required className={inputClass} value={form.cityName} onChange={set('cityName')} />
        </FormField>
        <FormField label="Region (optional)" htmlFor="z-region">
          <input id="z-region" className={inputClass} value={form.region} onChange={set('region')} />
        </FormField>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <FormField label="Delivery fee (GHS)" htmlFor="z-fee">
          <input id="z-fee" type="number" min="0" step="0.01" required className={inputClass} value={form.deliveryFee} onChange={set('deliveryFee')} />
        </FormField>
        <FormField label="Estimated delivery time (optional)" htmlFor="z-eta">
          <input id="z-eta" placeholder="e.g. 2-3 days" className={inputClass} value={form.estimatedDays} onChange={set('estimatedDays')} />
        </FormField>
      </div>

      <label className="flex items-center gap-2 text-sm text-ink-900">
        <input type="checkbox" checked={form.payOnDeliveryEnabled} onChange={set('payOnDeliveryEnabled')} />
        Pay on Delivery available in this city
      </label>

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
