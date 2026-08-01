const prisma = require('../../config/database');
const AppError = require('../../utils/AppError');

function slugify(text) {
  return text.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

async function generateUniqueSlug(name) {
  const base = slugify(name);
  let slug = base;
  let counter = 1;
  while (await prisma.category.findUnique({ where: { slug } })) {
    slug = `${base}-${counter}`;
    counter += 1;
  }
  return slug;
}

// --- Public ---

async function listCategories() {
  // Return top-level categories with their children nested, so the
  // frontend can render a category menu/tree in a single request.
  return prisma.category.findMany({
    where: { isActive: true, parentId: null },
    include: { children: { where: { isActive: true } } },
    orderBy: { name: 'asc' },
  });
}

async function getCategoryWithProducts(slug, { page = 1, limit = 20 } = {}) {
  const category = await prisma.category.findFirst({ where: { slug, isActive: true } });
  if (!category) {
    throw new AppError('Category not found', 404);
  }

  const where = { categoryId: category.id, isActive: true, deletedAt: null };

  const [products, total] = await Promise.all([
    prisma.product.findMany({
      where,
      include: { images: { where: { isPrimary: true }, take: 1 } },
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { createdAt: 'desc' },
    }),
    prisma.product.count({ where }),
  ]);

  return { category, products, pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } };
}

// --- Admin ---

async function adminListCategories() {
  return prisma.category.findMany({
    include: { children: true, _count: { select: { products: true } } },
    orderBy: { name: 'asc' },
  });
}

async function createCategory({ name, parentId, imageUrl }) {
  if (parentId) {
    const parent = await prisma.category.findUnique({ where: { id: parentId } });
    if (!parent) {
      throw new AppError('Selected parent category does not exist', 400);
    }
  }

  const slug = await generateUniqueSlug(name);
  return prisma.category.create({ data: { name, slug, parentId, imageUrl } });
}

async function updateCategory(id, data) {
  const category = await prisma.category.findUnique({ where: { id } });
  if (!category) {
    throw new AppError('Category not found', 404);
  }

  if (data.parentId === id) {
    throw new AppError('A category cannot be its own parent', 400);
  }

  return prisma.category.update({ where: { id }, data });
}

async function deleteCategory(id) {
  const category = await prisma.category.findUnique({
    where: { id },
    include: { _count: { select: { products: true, children: true } } },
  });

  if (!category) {
    throw new AppError('Category not found', 404);
  }

  if (category._count.products > 0) {
    throw new AppError('Cannot delete a category that still has products assigned to it', 409);
  }

  if (category._count.children > 0) {
    throw new AppError('Cannot delete a category that has subcategories. Delete or reassign them first.', 409);
  }

  await prisma.category.delete({ where: { id } });
}

module.exports = {
  listCategories,
  getCategoryWithProducts,
  adminListCategories,
  createCategory,
  updateCategory,
  deleteCategory,
};
