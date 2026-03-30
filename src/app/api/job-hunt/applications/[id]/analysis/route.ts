import { NextRequest, NextResponse } from 'next/server';
import mongoose, { Types } from 'mongoose';
import { connectDB } from '@/lib/mongodb';
import JobApplication from '@/models/JobApplication';
import { BookmarkedJob } from '@/models/BookmarkedJob';
import SettingsModel from '@/models/Settings';
import { ensureDashboardAuth } from '../../../_auth';
import { generateJobAnalysis } from '@/lib/bookmark-analysis-ai';

interface RouteParams { params: Promise<{ id: string }> }

export async function GET(_req: NextRequest, { params }: RouteParams) {
  const authError = await ensureDashboardAuth();
  if (authError) return authError;
  const { id } = await params;

  try {
    await connectDB();
    if (!Types.ObjectId.isValid(id)) {
      return NextResponse.json({ success: false, error: 'Invalid application ID' }, { status: 400 });
    }

    // Find bookmark that was converted to this application
    const bookmark = await BookmarkedJob.findOne({ linkedApplicationId: id })
      .select('aiAnalysis jobDescription').lean();

    return NextResponse.json({
      success: true,
      data: {
        aiAnalysis: (bookmark as any)?.aiAnalysis || null,
        jobDescription: (bookmark as any)?.jobDescription || null,
        sourceBookmarkId: bookmark ? (bookmark as any)._id.toString() : null,
      },
    });
  } catch {
    return NextResponse.json({ success: false, error: 'Failed to fetch analysis' }, { status: 500 });
  }
}

export async function POST(request: NextRequest, { params }: RouteParams) {
  const authError = await ensureDashboardAuth();
  if (authError) return authError;
  const { id } = await params;

  try {
    await connectDB();
    if (!Types.ObjectId.isValid(id)) {
      return NextResponse.json({ success: false, error: 'Invalid application ID' }, { status: 400 });
    }

    const body = await request.json();
    const { jobDescription: bodyJD } = body;

    const application = await JobApplication.findById(id).lean();
    if (!application) {
      return NextResponse.json({ success: false, error: 'Application not found' }, { status: 404 });
    }

    // Prefer JD from request body, then application, then linked bookmark
    let jobDescription = bodyJD?.trim();
    let sourceBookmarkId: string | null = null;

    if (!jobDescription) {
      jobDescription = (application as any).jobDescription?.trim();
    }

    if (!jobDescription) {
      const bookmark = await BookmarkedJob.findOne({ linkedApplicationId: id })
        .select('jobDescription _id').lean();
      if (bookmark) {
        jobDescription = (bookmark as any).jobDescription?.trim();
        sourceBookmarkId = (bookmark as any)._id.toString();
      }
    }

    if (!jobDescription) {
      return NextResponse.json({ success: false, error: 'Job description is required to generate analysis' }, { status: 400 });
    }

    const settings = await SettingsModel.findOne().lean();
    if (!settings) {
      return NextResponse.json({ success: false, error: 'Settings not configured' }, { status: 400 });
    }

    let skills: string[] = [];
    let projects: Array<{ title: string; shortDescription: string; technologies: string[] }> = [];
    try {
      const [skillDocs, projectDocs] = await Promise.all([
        mongoose.models.Skill?.find({ featured: true }).limit(10).lean() ?? [],
        mongoose.models.Project?.find({ featured: true }).limit(5).lean() ?? [],
      ]);
      skills = skillDocs.map((s: any) => s.name ?? s.title ?? '').filter(Boolean);
      projects = projectDocs.map((p: any) => ({
        title: p.title ?? '',
        shortDescription: p.shortDescription ?? p.description ?? '',
        technologies: Array.isArray(p.technologies) ? p.technologies : [],
      }));
    } catch { /* proceed without */ }

    const analysis = await generateJobAnalysis({
      jobTitle: (application as any).jobTitle,
      company: (application as any).company,
      jobDescription,
      sender: { name: settings.fullName, bio: settings.bio, skills, projects },
    });

    const aiAnalysis = { ...analysis, generatedAt: new Date() };

    // Save back to bookmark if it came from one, otherwise to application
    if (sourceBookmarkId) {
      await BookmarkedJob.findByIdAndUpdate(sourceBookmarkId, { aiAnalysis });
    } else {
      // Store on application itself as embedded (we add aiAnalysis field below if needed)
      // For now save JD to application if provided
      if (bodyJD?.trim()) {
        await JobApplication.findByIdAndUpdate(id, { jobDescription: bodyJD.trim() });
      }
    }

    return NextResponse.json({ success: true, data: { aiAnalysis, sourceBookmarkId } });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Failed to generate analysis' },
      { status: 500 }
    );
  }
}
