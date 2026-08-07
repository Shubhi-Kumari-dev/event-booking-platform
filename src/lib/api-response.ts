import { NextResponse } from "next/server";
import { ZodError } from "zod";
import { AppError } from "@/lib/errors";
import { logger } from "@/lib/logger";
import type { ApiErrorResponse, ApiSuccessResponse } from "@/types";

export function apiSuccess<T>(data: T, message?: string, status = 200) {
  const body: ApiSuccessResponse<T> = { success: true, data, message };
  return NextResponse.json(body, { status });
}

export function apiError(
  message: string,
  status = 500,
  code = "INTERNAL_ERROR",
  details?: unknown
) {
  const body: ApiErrorResponse = { success: false, error: { code, message, details } };
  return NextResponse.json(body, { status });
}

export function handleApiError(error: unknown) {
  if (error instanceof ZodError) {
    logger.warn("Validation error", { issues: error.issues });
    return apiError("Validation failed", 422, "VALIDATION_ERROR", error.flatten());
  }

  if (error instanceof AppError) {
    logger.warn(error.message, { code: error.code, statusCode: error.statusCode });
    return apiError(error.message, error.statusCode, error.code, error.details);
  }

  logger.error("Unhandled server error", {
    message: error instanceof Error ? error.message : String(error),
    stack: error instanceof Error ? error.stack : undefined,
  });

  return apiError("Something went wrong. Please try again.", 500, "INTERNAL_ERROR");
}