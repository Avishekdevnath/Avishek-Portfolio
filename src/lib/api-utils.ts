import { NextResponse } from 'next/server';

export type ApiResponse<T> = {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
};

export function sendSuccess<T = any>(data: T | null = null, message: string = 'Success') {
  return NextResponse.json({
    success: true,
    data,
    message
  }, {
    status: 200,
    headers: {
      'Content-Type': 'application/json',
    }
  });
}

export function sendError(error: string, status: number = 400) {
  return NextResponse.json({
    success: false,
    error
  }, {
    status,
    headers: {
      'Content-Type': 'application/json',
    }
  });
}

export function handleApiError(error: unknown) {
  // API Error

  if (error instanceof Error) {
    // Handle Mongoose validation errors
    if ((error as any).name === 'ValidationError') {
      const validationErrors = Object.values((error as any).errors)
        .map((err: any) => err.message)
        .join(', ');
      return sendError(`Validation error: ${validationErrors}`, 400);
    }

    // Handle Mongoose cast errors (invalid ObjectId)
    if ((error as any).name === 'CastError') {
      return sendError('Invalid ID format', 400);
    }

    return sendError(error.message, 500);
  }

  return sendError('An unexpected error occurred', 500);
} 