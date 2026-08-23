const STYLES = {
  Pending: 'bg-gold/15 text-gold',
  Confirmed: 'bg-forest-400/20 text-forest-400',
  Packed: 'bg-ink-400/40 text-cream',
  Shipped: 'bg-ink-400/40 text-cream',
  Out_for_Delivery: 'bg-gold/15 text-gold',
  Delivered: 'bg-forest-400/20 text-forest-400',
  Cancelled: 'bg-brick/15 text-brick-400',
};

export default function StatusBadge({ status }) {
  const label = status?.replace(/_/g, ' ') ?? 'Unknown';
  const style = STYLES[status] ?? 'bg-ink-400/40 text-cream';

  return (
    <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${style}`}>
      {label}
    </span>
  );
}
