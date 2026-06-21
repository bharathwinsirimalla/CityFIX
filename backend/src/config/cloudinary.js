import { v2 as cloudinary } from "cloudinary";

export const isCloudinaryConfigured = () => {
  return Boolean(
    process.env.CLOUDINARY_CLOUD_NAME?.trim() &&
      process.env.CLOUDINARY_API_KEY?.trim() &&
      (process.env.CLOUDINARY_API_SECRET?.trim() || process.env.CLOUDINARY_SECRET?.trim())
  );
};

export const configureCloudinary = () => {
  if (!isCloudinaryConfigured()) {
    throw new Error(
      "Cloudinary is not configured. Set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET in backend/.env"
    );
  }

  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME.trim(),
    api_key: process.env.CLOUDINARY_API_KEY.trim(),
    api_secret: (process.env.CLOUDINARY_API_SECRET || process.env.CLOUDINARY_SECRET).trim()
  });
  return cloudinary;
};

