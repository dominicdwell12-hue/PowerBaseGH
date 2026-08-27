const prisma = require('../../config/database');
const cloudinary = require('../../config/cloudinary');
const { uploadBufferToCloudinary } = require('../../utils/cloudinaryUpload');
const AppError = require('../../utils/AppError');

const CATEGORY_IMAGE_FOLDER = 'arcvan-gh/categories';

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
  // Also include each category's/child's real product count (`_count`)
  // so the storefront can show "N items" without inventing a number —
  // purely additive to the existing response shape, nothing removed.
  const categories = await prisma.category.findMany({
    where: { isActive: true, parentId: null },
    include: {
      children: { where: { isActive: true }, include: { _count: { select: { products: true } } } },
      _count: { select: { products: true } },
    },
    orderBy: { name: 'asc' },
  });

  return categories.map(({ _count, children, ...category }) => ({
    ...category,
    productCount: _count.products,
    children: children.map(({ _count: childCount, ...child }) => ({
      ...child,
      productCount: childCount.products,
    })),
  }));
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

async function createCategory({ name, parentId, imageFile }) {
  if (parentId) {
    const parent = await prisma.category.findUnique({ where: { id: parentId } });
    if (!parent) {
      throw new AppError('Selected parent category does not exist', 400);
    }
  }

  const slug = await generateUniqueSlug(name);

  let imageUrl;
  let cloudinaryPublicId;
  if (imageFile) {
    const result = await uploadBufferToCloudinary(imageFile.buffer, CATEGORY_IMAGE_FOLDER);
    imageUrl = result.secure_url;
    cloudinaryPublicId = result.public_id;
  }

  return prisma.category.create({ data: { name, slug, parentId, imageUrl, cloudinaryPublicId } });
}

async function updateCategory(id, { name, parentId, imageFile, removeImage }) {
  const category = await prisma.category.findUnique({ where: { id } });
  if (!category) {
    throw new AppError('Category not found', 404);
  }

  if (parentId === id) {
    throw new AppError('A category cannot be its own parent', 400);
  }

  const data = { name, parentId };

  if (imageFile) {
    // Replacing the image: upload the new one, then clean up the old one
    // in Cloudinary so we don't leak orphaned assets.
    const result = await uploadBufferToCloudinary(imageFile.buffer, CATEGORY_IMAGE_FOLDER);
    if (category.cloudinaryPublicId) {
      await cloudinary.uploader.destroy(category.cloudinaryPublicId).catch(() => {});
    }
    data.imageUrl = result.secure_url;
    data.cloudinaryPublicId = result.public_id;
  } else if (removeImage) {
    if (category.cloudinaryPublicId) {
      await cloudinary.uploader.destroy(category.cloudinaryPublicId).catch(() => {});
    }
    data.imageUrl = null;
    data.cloudinaryPublicId = null;
  }
  // If neither imageFile nor removeImage is set, imageUrl/cloudinaryPublicId
  // are simply left out of `data` — Prisma leaves those columns untouched.

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

  if (category.cloudinaryPublicId) {
    await cloudinary.uploader.destroy(category.cloudinaryPublicId).catch(() => {});
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
