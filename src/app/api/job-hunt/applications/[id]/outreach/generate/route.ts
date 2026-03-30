import { NextRequest, NextResponse } from 'next/server';
import mongoose from 'mongoose';
import { connectDB } from '@/lib/mongodb';
import JobApplication from '@/models/JobApplication';
import ApplicationContactModel from '@/models/ApplicationContact';
import ApplicationOutreachDraftModel from '@/models/ApplicationOutreachDraft';
import SettingsModel from '@/models/Settings';
import { ensureDashboardAuth } from '../../../../_auth';
import { generateApplicationOutreach } from '@/lib/application-outreach-ai';

interface RouteParams { params: Promise<{ id: string }> }

export async function POST(request: NextRequest, { params }: RouteParams) {
  const authError = await ensureDashboardAuth();
  if (authError) return authError;
  const { id } = await params;

  try {
    await connectDB();

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ success: false, error: 'Invalid application id' }, { status: 400 });
    }

    const { contactId } = await request.json();
    if (!contactId || !mongoose.Types.ObjectId.isValid(contactId)) {
      return NextResponse.json({ success: false, error: 'Valid contactId is required' }, { status: 400 });
    }

    // Fetch all required data in parallel
    const [application, contact, settings] = await Promise.all([
      JobApplication.findById(id).lean(),
      ApplicationContactModel.findOne({ _id: contactId, applicationId: id }).lean(),
      SettingsModel.findOne().lean(),
    ]);

    if (!application) {
      return NextResponse.json({ success: false, error: 'Application not found' }, { status: 404 });
    }
    if (!contact) {
      return NextResponse.json({ success: false, error: 'Contact not found' }, { status: 404 });
    }
    if (!settings) {
      return NextResponse.json({ success: false, error: 'Settings not configured' }, { status: 400 });
    }

    // Fetch skills + projects for context (best-effort, no hard fail)
    let skills: string[] = [];
    let projects: Array<{ title: string; shortDescription: string; technologies: string[] }> = [];
    try {
      const [skillDocs, projectDocs] = await Promise.all([
        mongoose.models.Skill?.find({ featured: true }).limit(8).lean() ?? [],
        mongoose.models.Project?.find({ featured: true }).limit(4).lean() ?? [],
      ]);
      skills = skillDocs.map((s: any) => s.name ?? s.title ?? '').filter(Boolean);
      projects = projectDocs.map((p: any) => ({
        title: p.title ?? '',
        shortDescription: p.shortDescription ?? p.description ?? '',
        technologies: Array.isArray(p.technologies) ? p.technologies : [],
      }));
    } catch {
      // proceed without skills/projects context
    }

    const { emailSubject, emailBody, linkedinDm } = await generateApplicationOutreach({
      contact: {
        name: (contact as any).name,
        title: (contact as any).title,
        roleAtCompany: (contact as any).roleAtCompany,
        bio: (contact as any).bio,
        linkedinUrl: (contact as any).linkedinUrl,
      },
      application: {
        company: (application as any).company,
        jobTitle: (application as any).jobTitle,
        jobUrl: (application as any).jobUrl,
      },
      sender: {
        name: settings.fullName,
        bio: settings.bio,
        skills,
        projects,
      },
    });

    // Upsert — overwrites any existing draft for this contact+application
    const draft = await ApplicationOutreachDraftModel.findOneAndUpdate(
      { applicationId: id, contactId },
      {
        applicationId: id,
        contactId,
        emailSubject,
        emailBody,
        linkedinDm,
        generatedAt: new Date(),
        modelUsed: process.env.OPENAI_API_KEY ? (process.env.OPENAI_MODEL || 'gpt-5.4') : 'gemini-pro',
      },
      { upsert: true, new: true, runValidators: true }
    ).lean();

    return NextResponse.json({
      success: true,
      data: {
        ...(draft as any),
        _id: (draft as any)._id.toString(),
        applicationId: id,
        contactId,
      },
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Failed to generate outreach' },
      { status: 500 }
    );
  }
}
