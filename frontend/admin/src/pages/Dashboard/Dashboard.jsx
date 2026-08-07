import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import StatCard from '../../components/charts/StatCard.jsx';
import SalesChart from '../../components/charts/SalesChart.jsx';
import Spinner from '../../components/common/Spinner.jsx';
import ErrorState from '../../components/common/ErrorState.jsx';
import { formatCurrency } from '../../utils/formatCurrency.js';
import * as reportApi from '../../api/reportApi.js';

export default function Dashboard() {
  const [period, setPeriod] = useState('daily');

  const summaryQuery = useQuery({ queryKey: ['dashboardSummary'], queryFn: reportApi.getSummary });
  const salesQuery = useQuery({
    queryKey: ['salesReport', period],
    queryFn: () => reportApi.getSalesReport({ period }),
  });
  const topProductsQuery = useQuery({ queryKey: ['topProducts'], queryFn: () => reportApi.getTopProducts(5) });

  if (summaryQuery.isLoading) return <Spinner label="Loading dashboard" />;

  if (summaryQuery.isError) {
    return <ErrorState message={summaryQuery.error?.message} onRetry={summaryQuery.refetch} />;
  }

  const summary = summaryQuery.data;

  return (
    <div className="space-y-8">
      <h1 className="font-display text-2xl font-800 text-ink-900">Dashboard</h1>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Total sales (paid)" value={formatCurrency(summary.totalSales)} accent="forest" />
        <StatCard label="Orders today" value={summary.ordersToday} />
        <StatCard
          label="Low stock alerts"
          value={summary.lowStock.count}
          accent={summary.lowStock.count > 0 ? 'brick' : 'gold'}
        />
        <StatCard label="New customers (7d)" value={summary.newCustomers} />
      </div>

      <section className="rounded-xl border border-ink-50 bg-white p-5">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-lg font-700 text-ink-900">Sales</h2>
          <select
            value={period}
            onChange={(e) => setPeriod(e.target.value)}
            className="rounded-lg border border-ink-100 px-2 py-1.5 text-sm"
          >
            <option value="daily">Daily</option>
            <option value="weekly">Weekly</option>
            <option value="monthly">Monthly</option>
          </select>
        </div>
        <div className="mt-4">
          {salesQuery.isLoading ? (
            <Spinner label="Loading sales" />
          ) : (
            <SalesChart data={salesQuery.data?.sales} />
          )}
        </div>
      </section>

      <div className="grid gap-6 lg:grid-cols-2">
        <section className="rounded-xl border border-ink-50 bg-white p-5">
          <h2 className="font-display text-lg font-700 text-ink-900">Low stock</h2>
          {!summary.lowStock.products.length && (
            <p className="mt-3 text-sm text-ash">Nothing running low right now.</p>
          )}
          <ul className="mt-3 space-y-2">
            {summary.lowStock.products.map((product) => (
              <li key={product.id} className="flex justify-between text-sm">
                <span className="text-ink-900">{product.name}</span>
                <span className="font-tag font-semibold text-brick-600">{product.stockQuantity} left</span>
              </li>
            ))}
          </ul>
          <Link to="/products" className="mt-3 inline-block text-sm font-medium text-gold-700 hover:underline">
            Manage products
          </Link>
        </section>

        <section className="rounded-xl border border-ink-50 bg-white p-5">
          <h2 className="font-display text-lg font-700 text-ink-900">Top products</h2>
          {topProductsQuery.isLoading ? (
            <Spinner label="Loading top products" />
          ) : (
            <ul className="mt-3 space-y-2">
              {topProductsQuery.data?.map((entry) => (
                <li key={entry.product.id} className="flex justify-between text-sm">
                  <span className="text-ink-900">{entry.product.name}</span>
                  <span className="font-tag text-ash">
                    {entry.quantitySold} sold · {formatCurrency(entry.revenue)}
                  </span>
                </li>
              ))}
              {!topProductsQuery.data?.length && <p className="text-sm text-ash">No sales yet.</p>}
            </ul>
          )}
        </section>
      </div>
    </div>
  );
}
