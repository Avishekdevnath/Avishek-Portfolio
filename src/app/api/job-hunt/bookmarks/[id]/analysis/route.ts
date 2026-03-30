import { NextRequest, NextResponse } from 'next/server';
import mongoose, { Types } from 'mongoose';
import { connectDB } from '@/lib/mongodb';
import { BookmarkedJob } from '@/models/BookmarkedJob';
import SettingsModel from '@/models/Settings';
import { ensureDashboardAuth } from '../../../_auth';
import { generateJobAnalysis } from '@/lib/bookmark-analysis-ai';

interface RouteParams { params: Promise<{ id: string }> }

export async function GET(_req: NextRequest, { params }: RouteParams) {
  const authError = await ensureDashboardAuth();
  if (authError) return authError;

  try {
    await connectDB();
    if (!Types.ObjectId.isValid(params.id)) {
      return NextResponse.json({ success: false, error: 'Invalid bookmark ID' }, { status: 400 });
    }

    const bookmark = await BookmarkedJob.findById(params.id).select('aiAnalysis jobDescription').lean();
    if (!bookmark) {
      return NextResponse.json({ success: false, error: 'Bookmark not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: (bookmark as any).aiAnalysis || null });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to fetch analysis' }, { status: 500 });
  }
}

export async function POST(_req: NextRequest, { params }: RouteParams) {
  const authError = await ensureDashboardAuth();
  if (authError) return authError;

  try {
    await connectDB();
    if (!Types.ObjectId.isValid(params.id)) {
      return NextResponse.json({ success: false, error: 'Invalid bookmark ID' }, { status: 400 });
    }

    const bookmark = await BookmarkedJob.findById(params.id).lean();
    if (!bookmark) {
      return NextResponse.json({ success: false, error: 'Bookmark not found' }, { status: 404 });
    }

    if (!(bookmark as any).jobDescription?.trim()) {
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
      jobTitle: (bookmark as any).jobTitle,
      company: (bookmark as any).company,
      jobDescription: (bookmark as any).jobDescription,
      sender: { name: settings.fullName, bio: settings.bio, skills, projects },
    });

    const aiAnalysis = { ...analysis, generatedAt: new Date() };

    await BookmarkedJob.findByIdAndUpdate(params.id, { aiAnalysis });

    return NextResponse.json({ success: true, data: aiAnalysis });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Failed to generate analysis' },
      { status: 500 }
    );
  }
}
