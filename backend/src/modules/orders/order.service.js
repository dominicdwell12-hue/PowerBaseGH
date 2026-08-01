const prisma = require('../../config/database');
const AppError = require('../../utils/AppError');

const CANCELLABLE_STATUSES = ['Pending', 'Confirmed'];

function pad(num, size) {
  return String(num).padStart(size, '0');
}

async function generateUniqueOrderNumber() {
  const now = new Date();
  const datePart = `${now.getFullYear()}${pad(now.getMonth() + 1, 2)}${pad(now.getDate(), 2)}`;

  // Collision odds on a 5-digit random suffix are negligible at this
  // scale, but we still verify + retry rather than trust it blindly.
  for (let attempt = 0; attempt < 5; attempt += 1) {
    const suffix = pad(Math.floor(Math.random() * 100000), 5);
    const orderNumber = `ORD-${datePart}-${suffix}`;
    const existing = await prisma.order.findUnique({ where: { orderNumber } });
    if (!existing) return orderNumber;
  }

  throw new AppError('Could not generate a unique order number, please try again', 500);
}

// Shared include so every endpoint that returns an order (create, get,
// list, tracking) has the same shape for the frontend to rely on.
const orderInclude = {
  items: true,
  address: true,
  deliveryZone: true,
  statusHistory: { orderBy: { createdAt: 'asc' } },
};

function serializeOrder(order) {
  return {
    id: order.id,
    orderNumber: order.orderNumber,
    status: order.orderStatus,
    paymentMethod: order.paymentMethod,
    paymentStatus: order.paymentStatus,
    subtotal: Number(order.subtotal),
    deliveryFee: Number(order.deliveryFee),
    total: Number(order.total),
    createdAt: order.createdAt,
    customer: order.user
      ? {
          id: order.user.id,
          name: `${order.user.firstName} ${order.user.lastName}`,
          email: order.user.email,
          phone: order.user.phone,
        }
      : undefined,
    address: order.address
      ? {
          recipientName: order.address.recipientName,
          phone: order.address.phone,
          street: order.address.street,
          landmark: order.address.landmark,
        }
      : undefined,
    deliveryZone: order.deliveryZone
      ? { cityName: order.deliveryZone.cityName, estimatedDays: order.deliveryZone.estimatedDays }
      : undefined,
    items: order.items?.map((item) => ({
      productId: item.productId,
      name: item.productNameSnapshot,
      unitPrice: Number(item.unitPrice),
      quantity: item.quantity,
      lineTotal: Number(item.lineTotal),
    })),
    statusHistory: order.statusHistory?.map((h) => ({
      status: h.status,
      note: h.note,
      createdAt: h.createdAt,
    })),
  };
}

// This is the checkout endpoint — it's where the Pay-on-Delivery
// business rule from the project brief actually gets enforced:
// POD is only valid if the *destination city* has it enabled, decided
// at order time from the chosen address's delivery zone, never trusted
// from client input.
async function createOrder(userId, { addressId, paymentMethod }) {
  const address = await prisma.address.findUnique({
    where: { id: addressId },
    include: { deliveryZone: true },
  });

  if (!address || address.userId !== userId) {
    throw new AppError('Address not found', 404);
  }

  if (!address.deliveryZone.isActive) {
    throw new AppError('Deliveries are currently unavailable for this city', 422);
  }

  if (paymentMethod === 'pay_on_delivery' && !address.deliveryZone.payOnDeliveryEnabled) {
    throw new AppError(
      `Pay on Delivery is only available in Kumasi. Orders to ${address.deliveryZone.cityName} must be paid before shipment.`,
      422
    );
  }

  const cart = await prisma.cart.findUnique({
    where: { userId },
    include: {
      items: { include: { product: true } },
    },
  });

  if (!cart || cart.items.length === 0) {
    throw new AppError('Your cart is empty', 400);
  }

  // Re-validate every line against the live product record — the cart
  // can go stale between "add to cart" and "checkout" (price changes,
  // stock sold out, product deactivated), so we never trust priceAtAdd
  // or the quantity at face value here.
  for (const item of cart.items) {
    const product = item.product;
    if (!product || product.deletedAt || !product.isActive) {
      throw new AppError(`"${product?.name || 'A product'}" in your cart is no longer available`, 409);
    }
    if (product.stockQuantity < item.quantity) {
      throw new AppError(`Only ${product.stockQuantity} unit(s) of "${product.name}" left in stock`, 409);
    }
  }

  const orderNumber = await generateUniqueOrderNumber();
  const deliveryFee = address.deliveryZone.deliveryFee;

  const order = await prisma.$transaction(async (tx) => {
    let subtotal = 0;
    const itemsData = cart.items.map((item) => {
      const unitPrice = item.product.discountPrice ?? item.product.price;
      const lineTotal = Number(unitPrice) * item.quantity;
      subtotal += lineTotal;

      return {
        productId: item.product.id,
        vendorId: item.product.vendorId,
        productNameSnapshot: item.product.name,
        unitPrice,
        quantity: item.quantity,
        lineTotal,
      };
    });

    const total = subtotal + Number(deliveryFee);

    const createdOrder = await tx.order.create({
      data: {
        orderNumber,
        userId,
        addressId: address.id,
        deliveryZoneId: address.deliveryZone.id,
        subtotal,
        deliveryFee,
        total,
        paymentMethod,
        paymentStatus: 'pending',
        orderStatus: 'Pending',
        items: { create: itemsData },
        statusHistory: {
          create: { status: 'Pending', note: 'Order placed', changedByUserId: userId },
        },
      },
      include: orderInclude,
    });

    // Decrement stock now, not on payment confirmation — this reserves
    // inventory at order time so two customers can't both check out the
    // last unit while one is still completing payment.
    for (const item of cart.items) {
      await tx.product.update({
        where: { id: item.product.id },
        data: { stockQuantity: { decrement: item.quantity } },
      });
    }

    await tx.cartItem.deleteMany({ where: { cartId: cart.id } });

    return createdOrder;
  });

  return serializeOrder(order);
}

async function listOrders(userId, { page = 1, limit = 20 } = {}) {
  const where = { userId };

  const [orders, total] = await Promise.all([
    prisma.order.findMany({
      where,
      include: orderInclude,
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.order.count({ where }),
  ]);

  return {
    orders: orders.map(serializeOrder),
    pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
  };
}

async function getOwnOrder(userId, orderNumber) {
  const order = await prisma.order.findUnique({ where: { orderNumber }, include: orderInclude });

  if (!order || order.userId !== userId) {
    throw new AppError('Order not found', 404);
  }

  return order;
}

async function getOrderDetail(userId, orderNumber) {
  const order = await getOwnOrder(userId, orderNumber);
  return serializeOrder(order);
}

async function getTracking(userId, orderNumber) {
  const order = await getOwnOrder(userId, orderNumber);
  return {
    orderNumber: order.orderNumber,
    status: order.orderStatus,
    statusHistory: order.statusHistory.map((h) => ({
      status: h.status,
      note: h.note,
      createdAt: h.createdAt,
    })),
  };
}

async function restockOrderItems(tx, items) {
  for (const item of items) {
    await tx.product.update({
      where: { id: item.productId },
      data: { stockQuantity: { increment: item.quantity } },
    });
  }
}

async function cancelOrder(userId, orderNumber, reason) {
  const order = await getOwnOrder(userId, orderNumber);

  if (!CANCELLABLE_STATUSES.includes(order.orderStatus)) {
    throw new AppError(
      `Order cannot be cancelled once it has been ${order.orderStatus.toLowerCase()}. Please contact support.`,
      422
    );
  }

  const updated = await prisma.$transaction(async (tx) => {
    // Release the reserved stock back to inventory.
    await restockOrderItems(tx, order.items);

    return tx.order.update({
      where: { id: order.id },
      data: {
        orderStatus: 'Cancelled',
        statusHistory: {
          create: {
            status: 'Cancelled',
            note: reason || 'Cancelled by customer',
            changedByUserId: userId,
          },
        },
      },
      include: orderInclude,
    });
  });

  // Note: if the order had already been paid (card/mobile money), the
  // refund itself is handled through the payments module, not here —
  // cancellation only reverses inventory and order state.

  return serializeOrder(updated);
}

// --- Admin ---

const orderIncludeWithUser = { ...orderInclude, user: true };

// The legal forward path a fulfilment team actually follows, plus
// Cancelled as an escape hatch from any non-terminal state. Admins
// can't skip stages (e.g. Pending straight to Shipped) or move an
// order backward — this is what keeps OrderStatusHistory a trustworthy
// timeline instead of something that can be rewritten arbitrarily.
const ORDER_STATUS_TRANSITIONS = {
  Pending: ['Confirmed', 'Cancelled'],
  Confirmed: ['Packed', 'Cancelled'],
  Packed: ['Shipped', 'Cancelled'],
  Shipped: ['Out_for_Delivery', 'Cancelled'],
  Out_for_Delivery: ['Delivered'],
  Delivered: [],
  Cancelled: [],
};

function buildAdminOrderWhere({ status, paymentStatus, dateFrom, dateTo, search }) {
  const where = {};
  if (status) where.orderStatus = status;
  if (paymentStatus) where.paymentStatus = paymentStatus;
  if (dateFrom || dateTo) {
    where.createdAt = {
      ...(dateFrom ? { gte: new Date(dateFrom) } : {}),
      ...(dateTo ? { lte: new Date(dateTo) } : {}),
    };
  }
  if (search) {
    where.OR = [
      { orderNumber: { contains: search } },
      { user: { email: { contains: search } } },
      { user: { firstName: { contains: search } } },
      { user: { lastName: { contains: search } } },
    ];
  }
  return where;
}

async function adminListOrders(query) {
  const { page = 1, limit = 20 } = query;
  const where = buildAdminOrderWhere(query);

  const [orders, total] = await Promise.all([
    prisma.order.findMany({
      where,
      include: orderIncludeWithUser,
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.order.count({ where }),
  ]);

  return {
    orders: orders.map(serializeOrder),
    pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
  };
}

async function adminGetOrder(orderNumber) {
  const order = await prisma.order.findUnique({
    where: { orderNumber },
    include: orderIncludeWithUser,
  });

  if (!order) {
    throw new AppError('Order not found', 404);
  }

  return serializeOrder(order);
}

async function adminUpdateStatus(adminUserId, orderNumber, { status, note }) {
  const order = await prisma.order.findUnique({ where: { orderNumber }, include: orderInclude });
  if (!order) {
    throw new AppError('Order not found', 404);
  }

  const allowedNext = ORDER_STATUS_TRANSITIONS[order.orderStatus] || [];
  if (!allowedNext.includes(status)) {
    const readableCurrent = order.orderStatus.replace(/_/g, ' ');
    if (allowedNext.length === 0) {
      throw new AppError(`Order is already ${readableCurrent} and cannot be updated further`, 422);
    }
    const readableOptions = allowedNext.map((s) => s.replace(/_/g, ' ')).join(', ');
    throw new AppError(
      `Cannot move order from ${readableCurrent} to ${status.replace(/_/g, ' ')}. Valid next status: ${readableOptions}`,
      422
    );
  }

  const updated = await prisma.$transaction(async (tx) => {
    // Cancelling from the admin side releases reserved stock exactly
    // like a customer-initiated cancellation does.
    if (status === 'Cancelled') {
      await restockOrderItems(tx, order.items);
    }

    return tx.order.update({
      where: { id: order.id },
      data: {
        orderStatus: status,
        statusHistory: {
          create: { status, note: note || null, changedByUserId: adminUserId },
        },
      },
      include: orderIncludeWithUser,
    });
  });

  return serializeOrder(updated);
}

module.exports = {
  createOrder,
  listOrders,
  getOrderDetail,
  getTracking,
  cancelOrder,
  adminListOrders,
  adminGetOrder,
  adminUpdateStatus,
};
