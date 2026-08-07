import { auth } from "@/lib/auth";
import { UnauthorizedError, ForbiddenError } from "@/lib/errors";
import type { Role, SessionUser } from "@/types";

export async function requireAuth(): Promise<SessionUser> {
  const session = await auth();

  if (!session?.user) {
    throw new UnauthorizedError();
  }

  return session.user as SessionUser;
}

export async function requireRole(...roles: Role[]): Promise<SessionUser> {
  const user = await requireAuth();

  if (!roles.includes(user.role)) {
    throw new ForbiddenError(`This action requires one of the following roles: ${roles.join(", ")}`);
  }

  return user;
}

export async function getOptionalUser(): Promise<SessionUser | null> {
  const session = await auth();
  return (session?.user as SessionUser) ?? null;
}