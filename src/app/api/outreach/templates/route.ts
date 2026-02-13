import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import OutreachTemplate from '@/models/OutreachTemplate';
import { ensureDashboardAuth } from '../_auth';

export async function GET(request: NextRequest) {
  const authError = ensureDashboardAuth();
  if (authError) return authError;

  try {
    await connectDB();

    const type = request.nextUrl.searchParams.get('type')?.trim();
    const tone = request.nextUrl.searchParams.get('tone')?.trim();
    const search = request.nextUrl.searchParams.get('search')?.trim();

    const query: Record<string, any> = {};
    if (type && ['cold', 'follow_up', 'referral', 'post_application'].includes(type)) {
      query.type = type;
    }
    if (tone && ['professional', 'friendly'].includes(tone)) {
      query.tone = tone;
    }
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { subjectTemplate: { $regex: search, $options: 'i' } },
        { bodyTemplate: { $regex: search, $options: 'i' } },
      ];
    }

    const templates = await OutreachTemplate.find(query).sort({ updatedAt: -1 }).lean();

    const data = templates.map((t: any) => ({
      _id: t._id.toString(),
      name: t.name,
      type: t.type,
      tone: t.tone,
      subjectTemplate: t.subjectTemplate,
      bodyTemplate: t.bodyTemplate,
      variables: t.variables || [],
      createdAt: t.createdAt,
      updatedAt: t.updatedAt,
    }));

    return NextResponse.json({ success: true, data });
  } catch {
    return NextResponse.json({ success: false, error: 'Failed to fetch templates' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const authError = ensureDashboardAuth();
  if (authError) return authError;

  try {
    await connectDB();
    const body = await request.json();

    const variables =
      typeof body.variables === 'string'
        ? body.variables
            .split(',')
            .map((v: string) => v.trim())
            .filter(Boolean)
        : Array.isArray(body.variables)
          ? body.variables
          : [];

    const template = new OutreachTemplate({
      name: body.name,
      type: body.type,
      tone: body.tone,
      subjectTemplate: body.subjectTemplate,
      bodyTemplate: body.bodyTemplate,
      variables,
    });

    await template.validate();
    await template.save();

    return NextResponse.json({
      success: true,
      data: {
        _id: template._id.toString(),
        name: template.name,
        type: template.type,
        tone: template.tone,
        subjectTemplate: template.subjectTemplate,
        bodyTemplate: template.bodyTemplate,
        variables: template.variables || [],
        createdAt: template.createdAt,
        updatedAt: template.updatedAt,
      },
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Failed to create template' },
      { status: 400 }
    );
  }
}

