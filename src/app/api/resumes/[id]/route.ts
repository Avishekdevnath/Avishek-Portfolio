import { NextRequest, NextResponse } from 'next/server';
import { isValidObjectId } from 'mongoose';
import connectDB from '@/lib/mongodb';
import { ResumeVariant } from '@/models/ResumeVariant';
import { buildNextSlugHistory, normalizeSlug } from '@/lib/slug';
import { ensureDashboardAuth } from '../../job-hunt/_auth';

function invalidId() {
  return NextResponse.json({ success: false, error: 'Invalid resume id' }, { status: 400 });
}

export async function GET(_request: NextRequest, { params }: { params: { id: string } }) {
  const authError = ensureDashboardAuth();
  if (authError) return authError;

  if (!isValidObjectId(params.id)) return invalidId();

  try {
    await connectDB();

    const item = await ResumeVariant.findById(params.id).read('primary').lean();
    if (!item) {
      return NextResponse.json({ success: false, error: 'Resume variant not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: { ...item, _id: String((item as any)._id) } });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Failed to fetch resume variant' },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  const authError = ensureDashboardAuth();
  if (authError) return authError;

  if (!isValidObjectId(params.id)) return invalidId();

  try {
    await connectDB();

    const body = await request.json();
    const variant = await ResumeVariant.findById(params.id);

    if (!variant) {
      return NextResponse.json({ success: false, error: 'Resume variant not found' }, { status: 404 });
    }

    const nextTitle = body.title !== undefined ? String(body.title).trim() : variant.title;
    const nextSummary = body.summary !== undefined ? String(body.summary).trim() : variant.summary;
    const nextMarkdown = body.markdownContent !== undefined
      ? String(body.markdownContent).trim()
      : variant.markdownContent;
    const nextTags = body.focusTags !== undefined
      ? (Array.isArray(body.focusTags)
          ? body.focusTags.map((t: unknown) => String(t).trim().toLowerCase()).filter(Boolean)
          : [])
      : variant.focusTags;

    if (!nextTitle) {
      return NextResponse.json({ success: false, error: 'Title is required' }, { status: 400 });
    }

    let nextSlug = variant.slug;
    if (body.slug !== undefined) {
      const normalized = normalizeSlug(String(body.slug || ''));
      if (!normalized) {
        return NextResponse.json({ success: false, error: 'Slug is required' }, { status: 400 });
      }

      const conflict = await ResumeVariant.exists({ slug: normalized, _id: { $ne: variant._id } });
      if (conflict) {
        return NextResponse.json({ success: false, error: 'Slug already exists' }, { status: 409 });
      }
      nextSlug = normalized;
    }

    const nextPublic =
      body.publicViewEnabled !== undefined ? Boolean(body.publicViewEnabled) : variant.publicViewEnabled;

    if (nextPublic && (!variant.fileUrl || variant.status !== 'ready')) {
      return NextResponse.json(
        { success: false, error: 'Only ready variants with uploaded files can be public' },
        { status: 400 }
      );
    }

    if (body.isPrimary === true) {
      await ResumeVariant.updateMany({ _id: { $ne: variant._id } }, { $set: { isPrimary: false } });
    }

    variant.title = nextTitle;
    variant.summary = nextSummary || undefined;
    variant.markdownContent = nextMarkdown || undefined;
    if (body.markdownContent !== undefined) {
      variant.markdownUpdatedAt = nextMarkdown ? new Date() : null;
    }
    variant.focusTags = nextTags;
    variant.publicViewEnabled = nextPublic;
    variant.isPrimary = body.isPrimary !== undefined ? Boolean(body.isPrimary) : variant.isPrimary;
    variant.slugHistory = buildNextSlugHistory(variant.slug, nextSlug, variant.slugHistory || []);
    variant.slug = nextSlug;

    await variant.save();

    return NextResponse.json({
      success: true,
      data: {
        ...variant.toObject(),
        _id: String(variant._id),
      },
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Failed to update resume variant' },
      { status: 500 }
    );
  }
}

export async function DELETE(_request: NextRequest, { params }: { params: { id: string } }) {
  const authError = ensureDashboardAuth();
  if (authError) return authError;

  if (!isValidObjectId(params.id)) return invalidId();

  try {
    await connectDB();

    const removed = await ResumeVariant.findByIdAndDelete(params.id);
    if (!removed) {
      return NextResponse.json({ success: false, error: 'Resume variant not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: { _id: String(removed._id) } });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Failed to delete resume variant' },
      { status: 500 }
    );
  }
}
