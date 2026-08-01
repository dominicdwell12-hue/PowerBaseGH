const multer = require('multer');
const AppError = require('../utils/AppError');

// Files are held in memory (not written to disk) and streamed straight
// to Cloudinary — no local file cleanup needed, and it works the same
// whether we're on a server with persistent disk or an ephemeral one.
const storage = multer.memoryStorage();

const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB per image
const MAX_FILES = 8; // per product

function fileFilter(req, file, cb) {
  if (!ALLOWED_MIME_TYPES.includes(file.mimetype)) {
    return cb(new AppError('Only JPEG, PNG, or WebP images are allowed', 400));
  }
  cb(null, true);
}

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: MAX_FILE_SIZE, files: MAX_FILES },
});

module.exports = upload;
