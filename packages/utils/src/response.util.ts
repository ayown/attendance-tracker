import type { ApiResponse } from '@attendance-tracker/shared-types';

export function successResponse<T>(data: T, message?: string): ApiResponse<T> {
  return { success: true, data, message };
}

export function errorResponse(error: string, message?: string): ApiResponse {
  return { success: false, error, message };
}
