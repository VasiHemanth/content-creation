const { v2: cloudinary } = require('cloudinary');

/**
 * Instagram and Threads fetch the video from a public URL, so local files go to
 * Cloudinary first. Returns the secure URL.
 */
async function hostFile(filePath, { image = false } = {}) {
  const { CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET } = process.env;
  if (!CLOUDINARY_CLOUD_NAME || !CLOUDINARY_API_KEY || !CLOUDINARY_API_SECRET) {
    throw new Error('Set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY and CLOUDINARY_API_SECRET in .env');
  }
  cloudinary.config({ cloud_name: CLOUDINARY_CLOUD_NAME, api_key: CLOUDINARY_API_KEY, api_secret: CLOUDINARY_API_SECRET });
  const r = await cloudinary.uploader.upload(filePath, {
    resource_type: image ? 'image' : 'video',
    public_id: `${image ? 'img' : 'vid'}_${Date.now()}`,
  });
  return r.secure_url;
}

module.exports = { hostFile };
