import { NextRequest, NextResponse } from 'next/server';
import { ensureDashboardAuth } from '../../_auth';
import { generateAIContent, buildImprovePrompt, parseAIResponse } from '@/lib/outreach-ai';

export async function POST(request: NextRequest) {
  const authError = ensureDashboardAuth();
  if (authError) return authError;

  try {
    const body = await request.json();
    const { currentSubject, currentBody, improvementType } = body;

    if (!currentSubject || !currentBody || !improvementType) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields: currentSubject, currentBody, improvementType' },
        { status: 400 }
      );
    }

    if (!['shorten', 'clarify', 'confident'].includes(improvementType)) {
      return NextResponse.json(
        { success: false, error: 'Invalid improvementType. Must be: shorten, clarify, or confident' },
        { status: 400 }
      );
    }

    const prompt = buildImprovePrompt({
      currentSubject,
      currentBody,
      improvementType,
    });

    const aiResponse = await generateAIContent(prompt);
    const { subject, body: improvedBody } = parseAIResponse(aiResponse);

    return NextResponse.json({
      success: true,
      data: {
        subject,
        body: improvedBody,
      },
    });
  } catch (error) {
    console.error('AI improve error:', error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Failed to improve email' },
      { status: 500 }
    );
  }
}
