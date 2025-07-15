import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Achievement from '@/models/Achievement';

export async function GET() {
  await dbConnect();
  try {
    const achievements = await Achievement.find().sort({ date: -1, createdAt: -1 });
    return NextResponse.json({ success: true, data: achievements });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to fetch achievements' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  await dbConnect();
  try {
    const body = await req.json();
    const achievement = await Achievement.create(body);
    return NextResponse.json({ success: true, data: achievement });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to create achievement' }, { status: 400 });
  }
} 