import { NextRequest, NextResponse } from 'next/server';
import mongoose from 'mongoose';
import { connectDB } from '@/lib/mongodb';
import OutreachTemplate from '@/models/OutreachTemplate';
import { ensureDashboardAuth } from '../../_auth';

export async function GET(_: NextRequest, context: { params: { id: string } }) {
  const authError = ensureDashboardAuth();
  if (authError) return authError;

  const { id } = context.params;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return NextResponse.json({ success: false, error: 'Invalid template id' }, { status: 400 });
  }

  try {
    await connectDB();
    const template = await OutreachTemplate.findById(id).lean();
    if (!template) {
      return NextResponse.json({ success: false, error: 'Template not found' }, { status: 404 });
    }

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
  } catch {
    return NextResponse.json({ success: false, error: 'Failed to fetch template' }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest, context: { params: { id: string } }) {
  const authError = ensureDashboardAuth();
  if (authError) return authError;

  const { id } = context.params;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return NextResponse.json({ success: false, error: 'Invalid template id' }, { status: 400 });
  }

  try {
    await connectDB();
    const template = await OutreachTemplate.findById(id);
    if (!template) {
      return NextResponse.json({ success: false, error: 'Template not found' }, { status: 404 });
    }

    const body = await request.json();

    if (typeof body.name === 'string') template.name = body.name;
    if (typeof body.type === 'string') template.type = body.type;
    if (typeof body.tone === 'string') template.tone = body.tone;
    if (typeof body.subjectTemplate === 'string') template.subjectTemplate = body.subjectTemplate;
    if (typeof body.bodyTemplate === 'string') template.bodyTemplate = body.bodyTemplate;
    if (typeof body.variables === 'string') {
      template.variables = body.variables
        .split(',')
        .map((v: string) => v.trim())
        .filter(Boolean);
    } else if (Array.isArray(body.variables)) {
      template.variables = body.variables.map((v: any) => String(v).trim()).filter(Boolean);
    }

    await template.save();
    return NextResponse.json({ success: true, message: 'Template updated' });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to update template' }, { status: 400 });
  }
}

export async function DELETE(_: NextRequest, context: { params: { id: string } }) {
  const authError = ensureDashboardAuth();
  if (authError) return authError;

  const { id } = context.params;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return NextResponse.json({ success: false, error: 'Invalid template id' }, { status: 400 });
  }

  try {
    await connectDB();
    const template = await OutreachTemplate.findByIdAndDelete(id);
    if (!template) {
      return NextResponse.json({ success: false, error: 'Template not found' }, { status: 404 });
    }
    return NextResponse.json({ success: true, message: 'Template deleted' });
  } catch {
    return NextResponse.json({ success: false, error: 'Failed to delete template' }, { status: 500 });
  }
}

