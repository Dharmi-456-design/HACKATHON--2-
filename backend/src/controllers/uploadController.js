const cloudinary = require('../config/cloudinary');
const asyncHandler = require('../utils/asyncHandler');

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

  res.status(201).json({ url: result.secure_url, public_id: result.public_id });
});

module.exports = { uploadImage };
