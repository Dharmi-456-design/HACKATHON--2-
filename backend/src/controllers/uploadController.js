const cloudinary = require('../config/cloudinary');
const asyncHandler = require('../utils/asyncHandler');

// Extract a Cloudinary public_id from an asset URL. Handles URLs that include
// an upload transformation and/or a version token, e.g.
//   .../image/upload/c_limit,w_1600/v1625023447/greenwatch/issues/abc.jpg
//   -> greenwatch/issues/abc
const extractPublicId = (url) => {
  if (typeof url !== 'string' || !url) return null;
  const match = url.match(/\/image\/upload\/([^?#]+)/);
  if (!match) return null;

  const parts = match[1].split('/').filter(Boolean);
  while (parts.length > 1) {
    const head = parts[0];
    const isVersion = /^v\d{4,}$/.test(head);
    const isTransform = /^[a-zA-Z][a-zA-Z0-9]*_[a-zA-Z0-9]+(,[a-zA-Z0-9_-]+)*$/.test(head);
    if (!isVersion && !isTransform) break;
    parts.shift();
  }

  const last = parts[parts.length - 1];
  parts[parts.length - 1] = last.replace(/\.[a-zA-Z0-9]+$/, '');
  return parts.join('/') || null;
};

// Best-effort deletion of a previously uploaded Cloudinary asset. Never throws.
const deleteCloudinaryImage = async (url) => {
  const publicId = extractPublicId(url);
  if (!publicId) return false;
  try {
    await cloudinary.uploader.destroy(publicId);
    return true;
  } catch {
    return false;
  }
};

const uploadImage = asyncHandler(async (req, res) => {
  if (!req.file) {
    const err = new Error('No image file provided');
    err.statusCode = 400;
    throw err;
  }

  const cloudinaryConfigured =
    process.env.CLOUDINARY_CLOUD_NAME &&
    process.env.CLOUDINARY_API_KEY &&
    process.env.CLOUDINARY_API_SECRET;

  if (!cloudinaryConfigured) {
    const err = new Error(
      'Image upload is not configured. Set CLOUDINARY_* env variables.'
    );
    err.statusCode = 503;
    throw err;
  }

  const result = await new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder: 'greenwatch/issues',
        resource_type: 'image',
        transformation: [{ width: 1600, crop: 'limit' }],
      },
      (error, image) => {
        if (error) {
          const wrapped = new Error('Image could not be processed. Please try again.');
          wrapped.statusCode = 502;
          return reject(wrapped);
        }
        resolve(image);
      }
    );
    stream.end(req.file.buffer);
  });

  res.status(201).json({ url: result.secure_url, public_id: result.public_id, publicId: result.public_id });
});

module.exports = { uploadImage, deleteCloudinaryImage, extractPublicId };
