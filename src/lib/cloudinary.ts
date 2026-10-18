import { v2 as cloudinary } from "cloudinary";
import fs from "fs/promises";
import path from "path";
import crypto from "crypto";
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
  logger.info("Cloudinary credentials not set — image uploads will automatically be saved to local storage (/public/uploads)");
}

export async function uploadImage(base64OrUrl: string, folder = "events") {
  if (isConfigured) {
    try {
      const result = await cloudinary.uploader.upload(base64OrUrl, {
        folder,
        resource_type: "image",
        transformation: [{ width: 1600, crop: "limit" }, { quality: "auto" }],
      });
      return { url: result.secure_url, publicId: result.public_id };
    } catch (err) {
      logger.warn("Cloudinary upload failed, falling back to local disk storage", { err });
    }
  }

  // Local storage fallback for local development or when Cloudinary is unconfigured
  try {
    const uploadDir = path.join(process.cwd(), "public", "uploads", folder);
    await fs.mkdir(uploadDir, { recursive: true });

    const matches = base64OrUrl.match(/^data:([A-Za-z0-9\-+/]+);base64,(.+)$/);
    let buffer: Buffer;
    let ext = "jpg";

    if (matches && matches.length === 3) {
      const mime = matches[1].toLowerCase();
      const data = matches[2];
      buffer = Buffer.from(data, "base64");
      if (mime.includes("png")) ext = "png";
      else if (mime.includes("webp")) ext = "webp";
      else if (mime.includes("gif")) ext = "gif";
      else if (mime.includes("svg")) ext = "svg";
      else ext = "jpg";
    } else if (base64OrUrl.startsWith("http://") || base64OrUrl.startsWith("https://")) {
      return { url: base64OrUrl, publicId: base64OrUrl };
    } else {
      buffer = Buffer.from(base64OrUrl, "base64");
    }

    const filename = `${crypto.randomBytes(16).toString("hex")}.${ext}`;
    const filePath = path.join(uploadDir, filename);
    await fs.writeFile(filePath, buffer);

    logger.info("Image saved locally to disk", { filename, folder });
    return { url: `/uploads/${folder}/${filename}`, publicId: filename };
  } catch (error) {
    logger.error("Failed to save image locally", { error });
    throw new InternalError("Failed to save uploaded image to local storage");
  }
}

export async function deleteImage(publicId: string) {
  if (isConfigured) {
    try {
      await cloudinary.uploader.destroy(publicId);
      return;
    } catch (err) {
      logger.warn("Cloudinary delete failed", { publicId, err });
    }
  }

  // Local delete fallback
  try {
    const filePath = path.join(process.cwd(), "public", "uploads", "events", publicId);
    await fs.unlink(filePath).catch(() => {});
  } catch {
    // Ignore error if file doesn't exist
  }
}

export { cloudinary };