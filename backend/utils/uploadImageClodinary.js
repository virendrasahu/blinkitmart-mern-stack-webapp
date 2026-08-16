import { v2 as cloudinary } from 'cloudinary';

// Configure Cloudinary credentials from environment variables
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME || process.env.CLODINARY_CLOUD_NAME || 'doyvz7zrp',
  api_key: process.env.CLOUDINARY_API_KEY || process.env.CLODINARY_API_KEY || '392519617791816',
  api_secret: process.env.CLOUDINARY_API_SECRET || process.env.CLODINARY_API_SECRET_KEY || 'X17JCVzHcsm1YmKdURvHDRX9VcY',
});

/**
 * Upload Image Stream to Cloudinary
 * 
 * What it does:
 * - Accepts a file buffer from Multer memory storage (req.file.buffer).
 * - Uploads the image buffer directly to Cloudinary cloud storage without saving to disk.
 * - Returns the secure HTTPS image URL.
 */
const uploadImageClodinary = async (imageFile) => {
  if (!imageFile) return null;

  const buffer = imageFile.buffer || Buffer.from(await imageFile.arrayBuffer());

  const uploadResult = await new Promise((resolve, reject) => {
    cloudinary.uploader
      .upload_stream(
        {
          folder: 'blinkit_user_avatars',
          resource_type: 'image',
        },
        (error, result) => {
          if (error) return reject(error);
          return resolve(result);
        }
      )
      .end(buffer);
  });

  return uploadResult;
};

export default uploadImageClodinary;
