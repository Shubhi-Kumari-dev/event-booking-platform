import { v2 as cloudinary } from "cloudinary";
import { logger } from "@/lib/logger";
import { InternalError } from "@/lib/errors";

const CLOUD_NAME = process.env.CLOUDINARY_CLOUD_NAME;
const API_KEY = process.env.CLOUDINARY_API_KEY;
const API_SECRET = process.env.CLOUDINARY_API_SECRET;

const isConfigured = Boolean(CLOUD_NAME && API_KEY && API_SECRET);

if (isConfigured) {
  cloudinary.config({
    cloud_name: CLOUD_NAME,
    api_key: API_KEY,
    api_secret: API_SECRET,
    secure: true,
  });
} else {
  logger.warn("Cloudinary credentials not set — image upload/delete will fail until configured");
}

export async function uploadImage(base64OrUrl: string, folder = "events") {
  if (!isConfigured) {
    throw new InternalError("Image upload is not configured on this server");
  }

  const result = await cloudinary.uploader.upload(base64OrUrl, {
    folder,
    resource_type: "image",
    transformation: [{ width: 1600, crop: "limit" }, { quality: "auto" }],
  });
  return { url: result.secure_url, publicId: result.public_id };
}

export async function deleteImage(publicId: string) {
  if (!isConfigured) {
    logger.warn("Skipping image delete — Cloudinary not configured", { publicId });
    return;
  }
  await cloudinary.uploader.destroy(publicId);
}

export { cloudinary };