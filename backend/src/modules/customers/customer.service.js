const prisma = require('../../config/database');
const AppError = require('../../utils/AppError');

// Scoped to the customer role everywhere in this module — this is a
// storefront customer list, not a way to browse or manage other admins.
const CUSTOMER_ROLE_FILTER = { role: { name: 'customer' } };

function serializeCustomer(user) {
  return {
    id: user.id,
    name: `${user.firstName} ${user.lastName}`,
    email: user.email,
    phone: user.phone,
    isActive: user.isActive,
    createdAt: user.createdAt,
    orderCount: user._count?.orders ?? undefined,
  };
}

async function listCustomers({ search, status, page = 1, limit = 20 }) {
  const where = {
    ...CUSTOMER_ROLE_FILTER,
    deletedAt: null,
    ...(status === 'active' ? { isActive: true } : {}),
    ...(status === 'inactive' ? { isActive: false } : {}),
    ...(search
      ? {
          OR: [
            { firstName: { contains: search } },
            { lastName: { contains: search } },
            { email: { contains: search } },
            { phone: { contains: search } },
          ],
        }
      : {}),
  };

  const [customers, total] = await Promise.all([
    prisma.user.findMany({
      where,
      include: { _count: { select: { orders: true } } },
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.user.count({ where }),
  ]);

  return {
    customers: customers.map(serializeCustomer),
    pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
  };
}

async function getCustomerById(id) {
  const user = await prisma.user.findFirst({ where: { id, ...CUSTOMER_ROLE_FILTER } });
  if (!user) {
    throw new AppError('Customer not found', 404);
  }
  return user;
}

async function getCustomerDetail(id) {
  const user = await getCustomerById(id);

  const [orders, orderStats] = await Promise.all([
    prisma.order.findMany({
      where: { userId: id },
      orderBy: { createdAt: 'desc' },
      take: 20,
      select: {
        orderNumber: true,
        orderStatus: true,
        paymentStatus: true,
        total: true,
        createdAt: true,
      },
    }),
    // Lifetime spend only counts orders the customer actually paid for —
    // a pile of cancelled or still-pending orders shouldn't inflate it.
    prisma.order.aggregate({
      where: { userId: id, paymentStatus: 'paid' },
      _sum: { total: true },
      _count: true,
    }),
  ]);

  return {
    ...serializeCustomer(user),
    stats: {
      totalOrders: orderStats._count,
      totalSpent: Number(orderStats._sum.total || 0),
    },
    recentOrders: orders.map((o) => ({
      orderNumber: o.orderNumber,
      status: o.orderStatus,
      paymentStatus: o.paymentStatus,
      total: Number(o.total),
      createdAt: o.createdAt,
    })),
  };
}

async function updateCustomerStatus(id, isActive) {
  await getCustomerById(id);

  const data = { isActive };
  // Deactivating should end any session in progress immediately, not
  // just block the next login — otherwise a still-valid access token
  // keeps working until it naturally expires.
  if (!isActive) {
    data.refreshTokenHash = null;
  }

  const user = await prisma.user.update({ where: { id }, data });
  return serializeCustomer(user);
}

module.exports = { listCustomers, getCustomerDetail, updateCustomerStatus };
