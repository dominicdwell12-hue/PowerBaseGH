const prisma = require('../../config/database');
const AppError = require('../../utils/AppError');

// Simple, readable slugs: lowercase, hyphenated, no special characters.
// Uniqueness is enforced by appending a short suffix if the base slug
// is already taken (rather than failing the whole create request).
function slugify(text) {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

async function generateUniqueSlug(name) {
  const base = slugify(name);
  let slug = base;
  let counter = 1;

  while (await prisma.product.findUnique({ where: { slug } })) {
    slug = `${base}-${counter}`;
    counter += 1;
  }

  return slug;
}

function buildSortOrder(sort) {
  switch (sort) {
    case 'price_asc':
      return { price: 'asc' };
    case 'price_desc':
      return { price: 'desc' };
    case 'rating':
      return { ratingAvg: 'desc' };
    case 'newest':
    default:
      return { createdAt: 'desc' };
  }
}

// --- Public ---

async function listProducts({ category, search, minPrice, maxPrice, sort, page, limit }) {
  const where = {
    isActive: true,
    deletedAt: null,
    ...(category ? { category: { slug: category } } : {}),
    ...(minPrice !== undefined || maxPrice !== undefined
      ? { price: { ...(minPrice !== undefined ? { gte: minPrice } : {}), ...(maxPrice !== undefined ? { lte: maxPrice } : {}) } }
      : {}),
    ...(search
      ? {
          OR: [
            { name: { contains: search } },
            { description: { contains: search } },
            { brand: { contains: search } },
          ],
        }
      : {}),
  };

  const [items, total] = await Promise.all([
    prisma.product.findMany({
      where,
      include: { images: { where: { isPrimary: true }, take: 1 }, category: true },
      orderBy: buildSortOrder(sort),
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.product.count({ where }),
  ]);

  return {
    items,
    pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
  };
}

async function getProductBySlug(slug) {
  const product = await prisma.product.findFirst({
    where: { slug, isActive: true, deletedAt: null },
    include: { images: { orderBy: { sortOrder: 'asc' } }, category: true, vendor: true },
  });

  if (!product) {
    throw new AppError('Product not found', 404);
  }

  return product;
}

async function getFeaturedProducts() {
  return prisma.product.findMany({
    where: { isFeatured: true, isActive: true, deletedAt: null },
    include: { images: { where: { isPrimary: true }, take: 1 } },
    take: 12,
    orderBy: { createdAt: 'desc' },
  });
}

async function getRelatedProducts(slug) {
  const product = await prisma.product.findUnique({ where: { slug } });
  if (!product) {
    throw new AppError('Product not found', 404);
  }

  return prisma.product.findMany({
    where: {
      categoryId: product.categoryId,
      id: { not: product.id },
      isActive: true,
      deletedAt: null,
    },
    include: { images: { where: { isPrimary: true }, take: 1 } },
    take: 8,
  });
}

// --- Admin ---

async function adminListProducts({ category, search, status, sort, page, limit }) {
  const where = {
    deletedAt: null,
    ...(status === 'active' ? { isActive: true } : {}),
    ...(status === 'inactive' ? { isActive: false } : {}),
    ...(category ? { category: { slug: category } } : {}),
    ...(search
      ? { OR: [{ name: { contains: search } }, { sku: { contains: search } }] }
      : {}),
  };

  const [items, total] = await Promise.all([
    prisma.product.findMany({
      where,
      include: { images: { where: { isPrimary: true }, take: 1 }, category: true },
      orderBy: buildSortOrder(sort),
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.product.count({ where }),
  ]);

  return { items, pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } };
}

async function createProduct(data) {
  const existingSku = await prisma.product.findUnique({ where: { sku: data.sku } });
  if (existingSku) {
    throw new AppError('A product with this SKU already exists', 409);
  }

  const category = await prisma.category.findUnique({ where: { id: data.categoryId } });
  if (!category) {
    throw new AppError('Selected category does not exist', 400);
  }

  const slug = await generateUniqueSlug(data.name);

  return prisma.product.create({
    data: { ...data, slug },
    include: { images: true, category: true },
  });
}

async function updateProduct(id, data) {
  const product = await prisma.product.findFirst({ where: { id, deletedAt: null } });
  if (!product) {
    throw new AppError('Product not found', 404);
  }

  if (data.sku && data.sku !== product.sku) {
    const existingSku = await prisma.product.findUnique({ where: { sku: data.sku } });
    if (existingSku) {
      throw new AppError('A product with this SKU already exists', 409);
    }
  }

  if (data.categoryId) {
    const category = await prisma.category.findUnique({ where: { id: data.categoryId } });
    if (!category) {
      throw new AppError('Selected category does not exist', 400);
    }
  }

  return prisma.product.update({
    where: { id },
    data,
    include: { images: true, category: true },
  });
}

async function deleteProduct(id) {
  const product = await prisma.product.findFirst({ where: { id, deletedAt: null } });
  if (!product) {
    throw new AppError('Product not found', 404);
  }

  // Soft delete — preserves referential integrity with historical orders
  // that reference this product (order_items keeps a name/price snapshot
  // anyway, but we never want to hard-delete a product that's been sold).
  await prisma.product.update({
    where: { id },
    data: { deletedAt: new Date(), isActive: false },
  });
}

async function updateStock(id, stockQuantity) {
  const product = await prisma.product.findFirst({ where: { id, deletedAt: null } });
  if (!product) {
    throw new AppError('Product not found', 404);
  }

  return prisma.product.update({ where: { id }, data: { stockQuantity } });
}

module.exports = {
  listProducts,
  getProductBySlug,
  getFeaturedProducts,
  getRelatedProducts,
  adminListProducts,
  createProduct,
  updateProduct,
  deleteProduct,
  updateStock,
};
