import multer from 'multer';
import { v2 as cloudinary } from 'cloudinary';
import { CloudinaryStorage } from 'multer-storage-cloudinary';

// Configure cloudinary with env variables
// You will need to add these to your .env file
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME || 'demo',
  api_key: process.env.CLOUDINARY_API_KEY || 'demo',
  api_secret: process.env.CLOUDINARY_API_SECRET || 'demo'
});

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'reviewpedia',
    allowedFormats: ['jpg', 'png', 'jpeg', 'webp'],
    transformation: [{ width: 800, height: 800, crop: 'limit' }]
  }
});

const chatStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'reviewpedia_chat',
    resource_type: 'auto', // Allows both image and video
    allowedFormats: ['jpg', 'png', 'jpeg', 'webp', 'mp4', 'mov', 'avi']
  }
});

export const upload = multer({ storage: storage });
export const chatUpload = multer({ storage: chatStorage });
export const cloudinaryInstance = cloudinary;
