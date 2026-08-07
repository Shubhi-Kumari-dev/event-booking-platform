import { NextRequest } from "next/server";
import { z } from "zod";
import { requireRole } from "@/lib/api-auth";
import { uploadImage } from "@/lib/cloudinary";
import { apiSuccess, handleApiError } from "@/lib/api-response";
import { ROLES } from "@/lib/constants";

const uploadSchema = z.object({
  image: z.string().min(1, "Image data is required"),
});

export async function POST(req: NextRequest) {
  try {
    await requireRole(ROLES.ORGANIZER, ROLES.ADMIN);
    const body = await req.json();
    const { image } = uploadSchema.parse(body);

    const result = await uploadImage(image, "events");

    return apiSuccess(result, "Image uploaded successfully");
  } catch (error) {
    return handleApiError(error);
  }
}