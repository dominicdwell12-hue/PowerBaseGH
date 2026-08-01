export default function StatCard({ label, value, accent = 'gold' }) {
  const accentClass = { gold: 'text-gold-700', brick: 'text-brick-600', forest: 'text-forest-600' }[accent];

  return (
    <div className="rounded-xl border border-ink-50 bg-white p-4">
      <p className="text-xs uppercase tracking-wide text-ash">{label}</p>
      <p className={`mt-1 font-tag text-2xl font-semibold ${accentClass}`}>{value}</p>
    </div>
  );
}
