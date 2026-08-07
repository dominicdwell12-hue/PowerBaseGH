const STYLES = {
  Pending: 'bg-gold-50 text-gold-700',
  Confirmed: 'bg-forest-50 text-forest-600',
  Packed: 'bg-ink-50 text-ink-600',
  Shipped: 'bg-ink-50 text-ink-600',
  Out_for_Delivery: 'bg-gold-100 text-gold-700',
  Delivered: 'bg-forest-50 text-forest-600',
  Cancelled: 'bg-brick-50 text-brick-600',
};

export default function StatusBadge({ status }) {
  const label = status?.replace(/_/g, ' ') ?? 'Unknown';
  const style = STYLES[status] ?? 'bg-ink-50 text-ink-600';

  return (
    <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${style}`}>
      {label}
    </span>
  );
}
