import { db } from "@/lib/db";
import { requireAuth } from "@/lib/api-auth";
import { apiSuccess, handleApiError } from "@/lib/api-response";
import { NotFoundError } from "@/lib/errors";

export async function GET() {
  try {
    const sessionUser = await requireAuth();

    const user = await db.user.findUnique({
      where: { id: sessionUser.id },
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        phone: true,
        role: true,
        createdAt: true,
        _count: {
          select: { events: true, bookings: true },
        },
      },
    });

    if (!user) {
      throw new NotFoundError("User");
    }

    return apiSuccess(user);
  } catch (error) {
    return handleApiError(error);
  }
}