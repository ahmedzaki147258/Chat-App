import multer from "multer";
import { v2 as cloudinary } from "cloudinary";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import { allowedImageFormat, maxImageSize } from "@/shared/types/image";

cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.CLOUD_API_KEY,
  api_secret: process.env.CLOUD_API_SECRET,
  secure: true
});

const userStorage = new CloudinaryStorage({
  cloudinary,
  params: async (req, file) => {
    return {
      folder: "ChatApp/users",
      allowed_formats: allowedImageFormat,
      overwrite: true
    };
  }
});

const messageStorage = new CloudinaryStorage({
  cloudinary,
  params: async (req, file) => {
    return {
      folder: "ChatApp/messages",
      allowed_formats: allowedImageFormat,
      overwrite: true
    };
  },
});

export const uploadUserImage = multer({
  storage: userStorage,
  limits: { fileSize: maxImageSize }, // 1 MB
});
export const uploadMessageImage = multer({
  storage: messageStorage,
  limits: { fileSize: maxImageSize }, // 1 MB
});

export { cloudinary };