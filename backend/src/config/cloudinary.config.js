import cloudinary from "cloudinary";
import multer from "multer";
import { Env } from "./env.config.js";

// Configure Cloudinary (used for profile pictures, etc.)
cloudinary.v2.config({
  cloud_name: Env.CLOUDINARY_CLOUD_NAME,
  api_key: Env.CLOUDINARY_API_KEY,
  api_secret: Env.CLOUDINARY_API_SECRET,
});

// ─── Default upload using memory storage ─────────────────────────────────────
// Works universally — no Cloudinary dependency for file upload middleware
export const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10 MB
});

// ─── Memory storage for receipt scanning ─────────────────────────────────────
// The file buffer is sent directly to Gemini Vision as base64.
export const memoryUpload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10 MB
  fileFilter: (_req, file, cb) => {
    const allowed = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
    if (allowed.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error("Unsupported file type. Use JPG, PNG, or WEBP."), false);
    }
  },
});
