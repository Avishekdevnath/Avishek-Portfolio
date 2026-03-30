import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function ensureDashboardAuth() {
  const cookieStore = await cookies();
  const isAuthenticated = cookieStore.get('auth')?.value === 'true';
  if (!isAuthenticated) {
    return NextResponse.json(
      { success: false, error: 'Unauthorized' },
      { status: 401 }
    );
  }
  return null;
}
