import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Tool from '@/models/Tool';

async function suggestIcon(name: string, description?: string): Promise<string> {
  // Use Google AI API to suggest an emoji/icon
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
    // Return only a single emoji/icon (strip extra text)
    if (text && text.length <= 3) return text;
    // Try to extract emoji from text
    const match = text?.match(/[\p{Emoji}]/gu);
    if (match && match.length > 0) return match[0];
    return '';
  } catch {
    return '';
  }
}

export async function GET() {
  await dbConnect();
  try {
    const tools = await Tool.find().sort({ createdAt: -1 });
    return NextResponse.json({ success: true, data: tools });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to fetch tools' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  await dbConnect();
  try {
    const body = await req.json();
    let icon = body.icon;
    if (!icon && body.name) {
      icon = await suggestIcon(body.name, body.description);
    }
    const tool = await Tool.create({ ...body, icon });
    return NextResponse.json({ success: true, data: tool });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to create tool' }, { status: 400 });
  }
} 