import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Achievement from '@/models/Achievement';

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  await dbConnect();
  try {
    const achievement = await Achievement.findById(params.id);
    if (!achievement) return NextResponse.json({ success: false, error: 'Not found' }, { status: 404 });
    return NextResponse.json({ success: true, data: achievement });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to fetch achievement' }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  await dbConnect();
  try {
    const body = await req.json();
    const achievement = await Achievement.findByIdAndUpdate(params.id, body, { new: true });
    if (!achievement) return NextResponse.json({ success: false, error: 'Not found' }, { status: 404 });
    return NextResponse.json({ success: true, data: achievement });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to update achievement' }, { status: 400 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  await dbConnect();
  try {
    const achievement = await Achievement.findByIdAndDelete(params.id);
    if (!achievement) return NextResponse.json({ success: false, error: 'Not found' }, { status: 404 });
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to delete achievement' }, { status: 400 });
  }
} 