import { v2 as cloudinary } from "cloudinary";
import dotenv from "dotenv";

dotenv.config();

// Cloudinary SDK natively reads CLOUDINARY_URL from env.
// But also support individual env vars as fallback.
if (process.env.CLOUDINARY_URL) {
  // SDK auto-configures from CLOUDINARY_URL
  cloudinary.config();
} else {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });
}

// Log config status (no secrets)
const cfg = cloudinary.config();
if (cfg.cloud_name) {
  console.log(`Cloudinary configured: cloud_name=${cfg.cloud_name}`);
} else {
  console.warn("⚠️ Cloudinary not configured — file uploads will fail. Set CLOUDINARY_URL in .env");
}

export default cloudinary;

