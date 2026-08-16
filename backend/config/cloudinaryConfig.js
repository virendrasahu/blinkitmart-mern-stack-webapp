import { v2 as cloudinary } from 'cloudinary';
import dotenv from 'dotenv';

dotenv.config();

/**
 * Cloudinary Configuration Helper
 * 
 * Configures Cloudinary API credentials for uploading product & category images.
 * Uses fallback placeholder images if Cloudinary environment variables are missing in local dev.
 */
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME || 'demo_cloud',
  api_key: process.env.CLOUDINARY_API_KEY || '1234567890',
  api_secret: process.env.CLOUDINARY_API_SECRET || 'secret_key',
});

export default cloudinary;
