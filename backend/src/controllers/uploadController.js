const cloudinary = require('../config/cloudinary');
const asyncHandler = require('../utils/asyncHandler');

// Extract a Cloudinary public_id from an asset URL
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

// Best-effort deletion of a previously uploaded Cloudinary asset
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
  const cloudinaryConfigured = Boolean(
    process.env.CLOUDINARY_CLOUD_NAME &&
    process.env.CLOUDINARY_API_KEY &&
    process.env.CLOUDINARY_API_SECRET
  );

  // 1. Check for multipart file upload
  if (req.file) {
    if (!cloudinaryConfigured) {
      const mime = req.file.mimetype || 'image/jpeg';
      const b64 = req.file.buffer.toString('base64');
      return res.status(201).json({
        url: `data:${mime};base64,${b64}`,
        public_id: `local-${Date.now()}`,
        success: true,
      });
    }

    const result = await new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        {
          folder: 'naturepulse/uploads',
          resource_type: 'image',
          transformation: [{ width: 1600, crop: 'limit' }],
        },
        (error, image) => {
          if (error) return reject(error);
          resolve(image);
        }
      );
      stream.end(req.file.buffer);
    }).catch(() => null);

    if (result?.secure_url) {
      return res.status(201).json({
        url: result.secure_url,
        public_id: result.public_id,
        publicId: result.public_id,
        success: true,
      });
    }
  }

  // 2. Check for base64 payload in req.body
  const base64Input = req.body?.base64 || req.body?.imageBase64 || req.body?.image || req.body?.dataUrl;
  if (base64Input) {
    const dataUri = base64Input.startsWith('data:')
      ? base64Input
      : `data:${req.body?.mime || 'image/jpeg'};base64,${base64Input}`;

    if (cloudinaryConfigured) {
      try {
        const uploadRes = await cloudinary.uploader.upload(dataUri, {
          folder: 'naturepulse/uploads',
          resource_type: 'image',
          transformation: [{ width: 1600, crop: 'limit' }],
        });
        return res.status(201).json({
          url: uploadRes.secure_url,
          public_id: uploadRes.public_id,
          publicId: uploadRes.public_id,
          success: true,
        });
      } catch (uploadErr) {
        console.warn('Cloudinary direct base64 upload notice:', uploadErr.message);
      }
    }

    return res.status(201).json({
      url: dataUri,
      public_id: `local-${Date.now()}`,
      success: true,
    });
  }

  return res.status(400).json({ error: 'No image file or base64 data provided' });
});

module.exports = { uploadImage, deleteCloudinaryImage, extractPublicId };
