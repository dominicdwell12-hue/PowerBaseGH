const streamifier = require('streamifier');
const cloudinary = require('../../config/cloudinary');
const prisma = require('../../config/database');
const AppError = require('../../utils/AppError');

// Uploads a single in-memory buffer (from multer) to Cloudinary, in the
// arcvan-gh/products folder, returning the secure URL + public_id.
function uploadBufferToCloudinary(buffer) {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder: 'arcvan-gh/products', resource_type: 'image' },
      (err, result) => {
        if (err) return reject(err);
        resolve(result);
      }
    );
    streamifier.createReadStream(buffer).pipe(stream);
  });
}

async function addImagesToProduct(productId, files) {
  const product = await prisma.product.findUnique({ where: { id: productId } });
  if (!product) {
    throw new AppError('Product not found', 404);
  }

  const existingCount = await prisma.productImage.count({ where: { productId } });

  const uploads = await Promise.all(files.map((file) => uploadBufferToCloudinary(file.buffer)));

  const created = await prisma.$transaction(
    uploads.map((result, index) =>
      prisma.productImage.create({
        data: {
          productId,
          imageUrl: result.secure_url,
          cloudinaryPublicId: result.public_id,
          isPrimary: existingCount === 0 && index === 0, // first image ever becomes primary
          sortOrder: existingCount + index,
        },
      })
    )
  );

  return created;
}

async function deleteProductImage(productId, imageId) {
  const image = await prisma.productImage.findFirst({ where: { id: imageId, productId } });
  if (!image) {
    throw new AppError('Image not found for this product', 404);
  }

  await cloudinary.uploader.destroy(image.cloudinaryPublicId);
  await prisma.productImage.delete({ where: { id: imageId } });

  // If we just deleted the primary image, promote the next one so the
  // product never ends up with zero primary images while it still has photos.
  if (image.isPrimary) {
    const next = await prisma.productImage.findFirst({
      where: { productId },
      orderBy: { sortOrder: 'asc' },
    });
    if (next) {
      await prisma.productImage.update({ where: { id: next.id }, data: { isPrimary: true } });
    }
  }
}

async function setPrimaryImage(productId, imageId) {
  const image = await prisma.productImage.findFirst({ where: { id: imageId, productId } });
  if (!image) {
    throw new AppError('Image not found for this product', 404);
  }

  await prisma.$transaction([
    prisma.productImage.updateMany({ where: { productId }, data: { isPrimary: false } }),
    prisma.productImage.update({ where: { id: imageId }, data: { isPrimary: true } }),
  ]);
}

module.exports = { addImagesToProduct, deleteProductImage, setPrimaryImage };
