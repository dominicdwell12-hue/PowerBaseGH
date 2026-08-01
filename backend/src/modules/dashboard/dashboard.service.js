const prisma = require('../../config/database');

// Matches the low-stock convention already used on the storefront
// (ProductCard flags "only N left" at this same threshold).
const LOW_STOCK_THRESHOLD = 5;

function startOfToday() {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
}

async function getSummary() {
  const todayStart = startOfToday();
  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

  const [salesAgg, ordersToday, lowStockProducts, lowStockCount, newCustomers] = await Promise.all([
    // Only orders actually paid for count toward revenue — same rule
    // used for a single customer's lifetime spend in customer.service.js.
    prisma.order.aggregate({
      where: { paymentStatus: 'paid' },
      _sum: { total: true },
    }),
    prisma.order.count({ where: { createdAt: { gte: todayStart } } }),
    prisma.product.findMany({
      where: { isActive: true, deletedAt: null, stockQuantity: { lte: LOW_STOCK_THRESHOLD } },
      orderBy: { stockQuantity: 'asc' },
      take: 10,
      select: { id: true, name: true, slug: true, stockQuantity: true },
    }),
    prisma.product.count({
      where: { isActive: true, deletedAt: null, stockQuantity: { lte: LOW_STOCK_THRESHOLD } },
    }),
    prisma.user.count({
      where: { role: { name: 'customer' }, createdAt: { gte: sevenDaysAgo } },
    }),
  ]);

  return {
    totalSales: Number(salesAgg._sum.total || 0),
    ordersToday,
    lowStock: { count: lowStockCount, products: lowStockProducts },
    newCustomers,
  };
}

// Buckets paid orders by day/week/month in application code rather than
// a DB-specific date-truncation function, so this works the same way
// regardless of the underlying database engine.
function bucketKey(date, period) {
  const d = new Date(date);
  if (period === 'monthly') {
    return d.toISOString().slice(0, 7); // YYYY-MM
  }
  if (period === 'weekly') {
    const day = (d.getUTCDay() + 6) % 7; // Monday = 0
    d.setUTCDate(d.getUTCDate() - day);
    return d.toISOString().slice(0, 10); // Monday of that week
  }
  return d.toISOString().slice(0, 10); // YYYY-MM-DD
}

async function getSalesData({ period = 'daily', dateFrom, dateTo }) {
  const rangeEnd = dateTo ?? new Date();
  const rangeStart = dateFrom ?? new Date(rangeEnd.getTime() - 30 * 24 * 60 * 60 * 1000);

  const orders = await prisma.order.findMany({
    where: {
      paymentStatus: 'paid',
      createdAt: { gte: rangeStart, lte: rangeEnd },
    },
    select: { total: true, createdAt: true },
    orderBy: { createdAt: 'asc' },
  });

  const buckets = new Map();
  for (const order of orders) {
    const key = bucketKey(order.createdAt, period);
    const bucket = buckets.get(key) ?? { period: key, totalSales: 0, orderCount: 0 };
    bucket.totalSales += Number(order.total);
    bucket.orderCount += 1;
    buckets.set(key, bucket);
  }

  return Array.from(buckets.values()).sort((a, b) => a.period.localeCompare(b.period));
}

async function getTopProducts({ limit = 10 }) {
  const grouped = await prisma.orderItem.groupBy({
    by: ['productId'],
    _sum: { quantity: true, lineTotal: true },
    orderBy: { _sum: { quantity: 'desc' } },
    take: limit,
  });

  if (!grouped.length) return [];

  const products = await prisma.product.findMany({
    where: { id: { in: grouped.map((g) => g.productId) } },
    select: { id: true, name: true, slug: true },
  });
  const productById = new Map(products.map((p) => [p.id, p]));

  return grouped.map((g) => ({
    product: productById.get(g.productId) ?? { id: g.productId, name: 'Deleted product', slug: null },
    quantitySold: g._sum.quantity ?? 0,
    revenue: Number(g._sum.lineTotal ?? 0),
  }));
}

function toCsvRow(fields) {
  return fields
    .map((field) => {
      const value = String(field ?? '');
      // Quote any field containing a comma, quote, or newline, per RFC 4180.
      return /[",\n]/.test(value) ? `"${value.replace(/"/g, '""')}"` : value;
    })
    .join(',');
}

async function exportSalesCsv({ dateFrom, dateTo }) {
  const rangeEnd = dateTo ?? new Date();
  const rangeStart = dateFrom ?? new Date(rangeEnd.getTime() - 30 * 24 * 60 * 60 * 1000);

  const orders = await prisma.order.findMany({
    where: { createdAt: { gte: rangeStart, lte: rangeEnd } },
    orderBy: { createdAt: 'asc' },
    select: {
      orderNumber: true,
      createdAt: true,
      total: true,
      paymentMethod: true,
      paymentStatus: true,
      orderStatus: true,
    },
  });

  const header = toCsvRow(['Order Number', 'Date', 'Total (GHS)', 'Payment Method', 'Payment Status', 'Order Status']);
  const rows = orders.map((o) =>
    toCsvRow([
      o.orderNumber,
      o.createdAt.toISOString(),
      Number(o.total).toFixed(2),
      o.paymentMethod,
      o.paymentStatus,
      o.orderStatus,
    ])
  );

  return [header, ...rows].join('\n');
}

module.exports = { getSummary, getSalesData, getTopProducts, exportSalesCsv };
