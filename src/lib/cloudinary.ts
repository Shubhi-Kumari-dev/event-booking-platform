import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

export async function uploadImage(base64OrUrl: string, folder = "events") {
  const result = await cloudinary.uploader.upload(base64OrUrl, {
    folder,
    resource_type: "image",
    transformation: [{ width: 1600, crop: "limit" }, { quality: "auto" }],
  });
  return { url: result.secure_url, publicId: result.public_id };
}

export async function deleteImage(publicId: string) {
  await cloudinary.uploader.destroy(publicId);
}

export { cloudinary };