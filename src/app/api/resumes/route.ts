import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import { ResumeVariant } from '@/models/ResumeVariant';
import { buildUniqueSlug, isValidResumeSlug, normalizeResumeSlug } from '@/lib/resume-slug';
import { ensureDashboardAuth } from '../job-hunt/_auth';

export async function GET() {
  const authError = await ensureDashboardAuth();
  if (authError) return authError;

  try {
    await connectDB();

    const items = await ResumeVariant.find({}).read('primary').sort({ updatedAt: -1 }).lean();

    return NextResponse.json({
      success: true,
      data: items.map((item: any) => ({
        ...item,
        _id: String(item._id),
      })),
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Failed to fetch resumes' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  const authError = await ensureDashboardAuth();
  if (authError) return authError;

  try {
    await connectDB();

    const body = await request.json();
    const title = String(body.title || '').trim();
    const inputSlug = String(body.slug || '').trim();
    const summary = String(body.summary || '').trim();
    const markdownContent = body.markdownContent !== undefined ? String(body.markdownContent) : '';
    const normalizedMarkdown = markdownContent.trim();
    const focusTags = Array.isArray(body.focusTags)
      ? body.focusTags.map((t: unknown) => String(t).trim().toLowerCase()).filter(Boolean)
      : [];

    if (!title) {
      return NextResponse.json({ success: false, error: 'Title is required' }, { status: 400 });
    }

    let slug = normalizeResumeSlug(inputSlug || title);
    if (!slug) {
      return NextResponse.json({ success: false, error: 'Invalid slug value' }, { status: 400 });
    }

    if (!isValidResumeSlug(slug)) {
      return NextResponse.json({ success: false, error: 'Slug format is invalid' }, { status: 400 });
    }

    slug = await buildUniqueSlug(slug, async (candidate) => {
      const existing = await ResumeVariant.exists({ slug: candidate });
      return Boolean(existing);
    });

    const variant = await ResumeVariant.create({
      title,
      slug,
      focusTags,
      summary: summary || undefined,
      markdownContent: normalizedMarkdown || undefined,
      markdownUpdatedAt: normalizedMarkdown ? new Date() : null,
      publicViewEnabled: false,
      isPrimary: false,
      status: 'draft',
      uploadSource: 'dashboard',
    });

    return NextResponse.json(
      {
        success: true,
        data: {
          ...variant.toObject(),
          _id: String(variant._id),
        },
      },
      { status: 201 }
    );
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Failed to create resume variant' },
      { status: 500 }
    );
  }
}
