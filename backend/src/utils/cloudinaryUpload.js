const streamifier = require('streamifier');
const cloudinary = require('../config/cloudinary');

// Uploads a single in-memory buffer (from multer) to Cloudinary under the
// given folder, returning the full Cloudinary result (secure_url, public_id, etc).
// Shared by any module that needs to push one image to Cloudinary.
function uploadBufferToCloudinary(buffer, folder) {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder, resource_type: 'image' },
      (err, result) => {
        if (err) return reject(err);
        resolve(result);
      }
    );
    streamifier.createReadStream(buffer).pipe(stream);
  });
}

module.exports = { uploadBufferToCloudinary };
