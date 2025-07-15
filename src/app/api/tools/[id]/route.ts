import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Tool from '@/models/Tool';

async function suggestIcon(name: string, description?: string): Promise<string> {
  const apiKey = process.env.GOOGLE_AI_API_KEY;
  if (!apiKey) return '';
  const prompt = `Suggest a single emoji or icon for a tool named "${name}". Description: ${description || ''}. Only return the emoji or icon, nothing else.`;
  try {
    const res = await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=' + apiKey, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }]
      })
    });
    const data = await res.json();
    const text = data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim();
    if (text && text.length <= 3) return text;
    const match = text?.match(/[\p{Emoji}]/gu);
    if (match && match.length > 0) return match[0];
    return '';
  } catch {
    return '';
  }
}

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  await dbConnect();
  try {
    const tool = await Tool.findById(params.id);
    if (!tool) return NextResponse.json({ success: false, error: 'Not found' }, { status: 404 });
    return NextResponse.json({ success: true, data: tool });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to fetch tool' }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  await dbConnect();
  try {
    const body = await req.json();
    let icon = body.icon;
    if (!icon && body.name) {
      icon = await suggestIcon(body.name, body.description);
    }
    const tool = await Tool.findByIdAndUpdate(params.id, { ...body, icon }, { new: true });
    if (!tool) return NextResponse.json({ success: false, error: 'Not found' }, { status: 404 });
    return NextResponse.json({ success: true, data: tool });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to update tool' }, { status: 400 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  await dbConnect();
  try {
    const tool = await Tool.findByIdAndDelete(params.id);
    if (!tool) return NextResponse.json({ success: false, error: 'Not found' }, { status: 404 });
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to delete tool' }, { status: 400 });
  }
} 