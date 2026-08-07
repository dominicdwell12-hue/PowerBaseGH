import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { formatCurrency } from '../../utils/formatCurrency.js';

export default function SalesChart({ data }) {
  if (!data?.length) {
    return <p className="py-12 text-center text-sm text-ash">No sales in this period yet.</p>;
  }

  return (
    <ResponsiveContainer width="100%" height={280}>
      <LineChart data={data} margin={{ top: 8, right: 16, left: 8, bottom: 8 }}>
        <CartesianGrid stroke="#EEF0F5" vertical={false} />
        <XAxis dataKey="period" tick={{ fontSize: 12, fill: '#78756C' }} axisLine={false} tickLine={false} />
        <YAxis
          tick={{ fontSize: 12, fill: '#78756C' }}
          axisLine={false}
          tickLine={false}
          tickFormatter={(v) => formatCurrency(v)}
          width={90}
        />
        <Tooltip formatter={(value) => formatCurrency(value)} labelStyle={{ color: '#14213A' }} />
        <Line type="monotone" dataKey="totalSales" stroke="#C98A2C" strokeWidth={2} dot={false} />
      </LineChart>
    </ResponsiveContainer>
  );
}
