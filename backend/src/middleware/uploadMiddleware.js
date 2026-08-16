const multer = require('multer');

const IMAGE_MIME_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/heic'];
const MAX_FILE_SIZE = 5 * 1024 * 1024;

const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  const declared = (file.mimetype || '').toLowerCase();
  if (IMAGE_MIME_TYPES.includes(declared) || declared === 'application/octet-stream') {
    cb(null, true);
  } else {
    cb(new Error('Only image files (jpeg, png, gif, webp, heic) are allowed'), false);
  }
};

const upload = multer({
  storage,
  limits: { fileSize: MAX_FILE_SIZE, files: 1 },
  fileFilter,
});

// Detect the real file type from magic bytes so a client cannot spoof the MIME
// type (e.g. upload HTML/JS disguised as image/jpeg). Returns null when the
// content is not a supported image.
function detectImageType(buffer) {
  if (!buffer || buffer.length < 4) return null;

  // JPEG: FF D8 FF
  if (buffer.length >= 3 && buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff) {
    return 'image/jpeg';
  }

  // PNG: 89 50 4E 47
  if (buffer[0] === 0x89 && buffer[1] === 0x50 && buffer[2] === 0x4e && buffer[3] === 0x47) {
    return 'image/png';
  }

  // GIF87a / GIF89a
  if (
    buffer.length >= 6 &&
    buffer[0] === 0x47 &&
    buffer[1] === 0x49 &&
    buffer[2] === 0x46 &&
    buffer[3] === 0x38 &&
    (buffer[4] === 0x37 || buffer[4] === 0x39) &&
    buffer[5] === 0x61
  ) {
    return 'image/gif';
  }

  // WebP: RIFF....WEBP
  if (
    buffer.length >= 12 &&
    buffer[0] === 0x52 &&
    buffer[1] === 0x49 &&
    buffer[2] === 0x46 &&
    buffer[3] === 0x46 &&
    buffer[8] === 0x57 &&
    buffer[9] === 0x45 &&
    buffer[10] === 0x42 &&
    buffer[11] === 0x50
  ) {
    return 'image/webp';
  }

  // HEIC / HEIF: ISO-BMFF "ftyp" box (brand heic/heix/hevc/hevx/mif1/msf1)
  for (let i = 4; i <= 28 && i + 8 <= buffer.length; i += 4) {
    if (
      buffer[i] === 0x66 &&
      buffer[i + 1] === 0x74 &&
      buffer[i + 2] === 0x79 &&
      buffer[i + 3] === 0x70
    ) {
      const brand = String.fromCharCode(
        buffer[i + 4],
        buffer[i + 5],
        buffer[i + 6],
        buffer[i + 7]
      );
      if (['heic', 'heix', 'hevc', 'hevx', 'mif1', 'msf1'].includes(brand)) return 'image/heic';
    }
  }

  return null;
}

// Runs after multer has the full buffer in memory. Rejects spoofed MIME types
// and non-image payloads before anything reaches Cloudinary.
const validateImageBuffer = (req, res, next) => {
  if (!req.file) return next();

  const detected = detectImageType(req.file.buffer);
  if (!detected) {
    res.status(400);
    return next(new Error('File content is not a supported image'));
  }

  const declared = (req.file.mimetype || '').toLowerCase();
  if (declared !== 'application/octet-stream' && declared !== detected) {
    res.status(400);
    return next(new Error('File content does not match its declared image type'));
  }

  req.file.detectedMimeType = detected;
  return next();
};

module.exports = { upload, validateImageBuffer, detectImageType, IMAGE_MIME_TYPES, MAX_FILE_SIZE };
