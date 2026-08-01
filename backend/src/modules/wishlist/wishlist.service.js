const prisma = require('../../config/database');
const AppError = require('../../utils/AppError');

function serializeItem(item) {
  const product = item.product;
  return {
    id: item.id,
    addedAt: item.createdAt,
    product: {
      id: product.id,
      name: product.name,
      slug: product.slug,
      price: Number(product.price),
      discountPrice: product.discountPrice ? Number(product.discountPrice) : null,
      image: product.images[0]?.imageUrl || null,
      isActive: product.isActive && !product.deletedAt,
      inStock: product.stockQuantity > 0,
    },
  };
}

async function listWishlist(userId) {
  const items = await prisma.wishlistItem.findMany({
    where: { userId },
    include: {
      product: { include: { images: { where: { isPrimary: true }, take: 1 } } },
    },
    orderBy: { createdAt: 'desc' },
  });

  return items.map(serializeItem);
}

async function addToWishlist(userId, productId) {
  const product = await prisma.product.findUnique({ where: { id: productId } });
  if (!product || product.deletedAt || !product.isActive) {
    throw new AppError('Product not found', 404);
  }

  // Unique constraint on (userId, productId) means a duplicate add is a
  // no-op from the customer's perspective — just return the current list
  // rather than erroring on something that isn't really a conflict.
  const existing = await prisma.wishlistItem.findUnique({
    where: { userId_productId: { userId, productId } },
  });

  if (!existing) {
    await prisma.wishlistItem.create({ data: { userId, productId } });
  }

  return listWishlist(userId);
}

async function removeFromWishlist(userId, productId) {
  const existing = await prisma.wishlistItem.findUnique({
    where: { userId_productId: { userId, productId } },
  });

  if (!existing) {
    throw new AppError('Product is not in your wishlist', 404);
  }

  await prisma.wishlistItem.delete({ where: { id: existing.id } });
  return listWishlist(userId);
}

module.exports = { listWishlist, addToWishlist, removeFromWishlist };
