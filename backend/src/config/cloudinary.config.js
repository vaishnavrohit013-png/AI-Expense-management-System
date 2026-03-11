import cloudinary from "cloudinary";
import multer from "multer";
import CloudinaryStorage from "multer-storage-cloudinary";
import { Env } from "./env.config.js";

// Configure Cloudinary
cloudinary.v2.config({
  cloud_name: Env.CLOUDINARY_CLOUD_NAME,
  api_key: Env.CLOUDINARY_API_KEY,
  api_secret: Env.CLOUDINARY_API_SECRET,
});

const storage = new CloudinaryStorage({
  cloudinary: cloudinary.v2,
  folder: "receipts",
  allowedFormats: ["jpg", "png", "jpeg"],
});

export const upload = multer({ storage });
