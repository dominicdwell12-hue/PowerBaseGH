const prisma = require('../../config/database');
const AppError = require('../../utils/AppError');

// Every customer has at most one cart. We lazily create it on first
// touch rather than at registration time, so we never carry dead rows
// for users who never shop.
async function getOrCreateCart(userId) {
  let cart = await prisma.cart.findUnique({ where: { userId } });
  if (!cart) {
    cart = await prisma.cart.create({ data: { userId } });
  }
  return cart;
}

// Shared include/shape so GET /cart and the mutation endpoints
// (add/update/remove) all return the exact same cart representation —
// the frontend can swap in whatever the mutation response is without
// a follow-up GET.
const cartInclude = {
  items: {
    include: {
      product: {
        include: { images: { where: { isPrimary: true }, take: 1 } },
      },
    },
    orderBy: { id: 'asc' },
  },
};

function serializeCart(cart) {
  const items = cart.items.map((item) => {
    const product = item.product;
    const isAvailable = product.isActive && !product.deletedAt;
    const inStock = product.stockQuantity >= item.quantity;
    const lineTotal = Number(item.priceAtAdd) * item.quantity;

    return {
      id: item.id,
      productId: product.id,
      name: product.name,
      slug: product.slug,
      image: product.images[0]?.imageUrl || null,
      quantity: item.quantity,
      priceAtAdd: Number(item.priceAtAdd),
      currentPrice: Number(product.discountPrice ?? product.price),
      lineTotal,
      isAvailable,
      inStock,
      stockQuantity: product.stockQuantity,
    };
  });

  const subtotal = items.reduce((sum, item) => sum + item.lineTotal, 0);
  const hasUnavailableItems = items.some((item) => !item.isAvailable || !item.inStock);

  return {
    id: cart.id,
    items,
    itemCount: items.reduce((sum, item) => sum + item.quantity, 0),
    subtotal,
    hasUnavailableItems,
  };
}

async function getCart(userId) {
  const cart = await getOrCreateCart(userId);
  const fullCart = await prisma.cart.findUnique({ where: { id: cart.id }, include: cartInclude });
  return serializeCart(fullCart);
}

async function assertProductPurchasable(productId, requestedQuantity) {
  const product = await prisma.product.findUnique({ where: { id: productId } });

  if (!product || product.deletedAt || !product.isActive) {
    throw new AppError('Product not found', 404);
  }

  if (product.stockQuantity < requestedQuantity) {
    throw new AppError(
      `Only ${product.stockQuantity} unit(s) of "${product.name}" are in stock`,
      409
    );
  }

  return product;
}

async function addItem(userId, { productId, quantity }) {
  const cart = await getOrCreateCart(userId);
  const existingItem = await prisma.cartItem.findFirst({ where: { cartId: cart.id, productId } });

  const totalQuantity = (existingItem?.quantity || 0) + quantity;
  const product = await assertProductPurchasable(productId, totalQuantity);
  const price = product.discountPrice ?? product.price;

  if (existingItem) {
    await prisma.cartItem.update({
      where: { id: existingItem.id },
      data: { quantity: totalQuantity, priceAtAdd: price },
    });
  } else {
    await prisma.cartItem.create({
      data: { cartId: cart.id, productId, quantity, priceAtAdd: price },
    });
  }

  return getCart(userId);
}

async function updateItemQuantity(userId, itemId, quantity) {
  const cart = await getOrCreateCart(userId);
  const item = await prisma.cartItem.findUnique({ where: { id: itemId } });

  if (!item || item.cartId !== cart.id) {
    throw new AppError('Cart item not found', 404);
  }

  await assertProductPurchasable(item.productId, quantity);
  await prisma.cartItem.update({ where: { id: itemId }, data: { quantity } });

  return getCart(userId);
}

async function removeItem(userId, itemId) {
  const cart = await getOrCreateCart(userId);
  const item = await prisma.cartItem.findUnique({ where: { id: itemId } });

  if (!item || item.cartId !== cart.id) {
    throw new AppError('Cart item not found', 404);
  }

  await prisma.cartItem.delete({ where: { id: itemId } });
  return getCart(userId);
}

async function clearCart(userId) {
  const cart = await getOrCreateCart(userId);
  await prisma.cartItem.deleteMany({ where: { cartId: cart.id } });
  return getCart(userId);
}

module.exports = {
  getCart,
  addItem,
  updateItemQuantity,
  removeItem,
  clearCart,
};
