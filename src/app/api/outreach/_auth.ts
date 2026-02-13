import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export function ensureDashboardAuth() {
  const isAuthenticated = cookies().get('auth')?.value === 'true';
  if (!isAuthenticated) {
    return NextResponse.json(
      { success: false, error: 'Unauthorized' },
      { status: 401 }
    );
  }
  return null;
}

