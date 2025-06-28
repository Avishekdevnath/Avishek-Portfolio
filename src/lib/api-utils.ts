import { NextResponse } from 'next/server';

export type ApiResponse<T> = {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
};

export const sendSuccess = <T>(data: T, message?: string): NextResponse => {
  return NextResponse.json({
    success: true,
    data,
    message,
  });
};

export const sendError = (error: string, status: number = 500): NextResponse => {
  return NextResponse.json(
    {
      success: false,
      error,
    },
    { status }
  );
};

export const handleApiError = (error: unknown): NextResponse => {
  console.error('API Error:', error);
  if (error instanceof Error) {
    return sendError(error.message);
  }
  return sendError('An unexpected error occurred');
}; 