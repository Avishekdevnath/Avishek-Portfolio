import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import OutreachContact from '@/models/OutreachContact';
import OutreachCompany from '@/models/OutreachCompany';
import OutreachDraft from '@/models/OutreachDraft';
import Project from '@/models/Project';
import Skill from '@/models/Skill';
import Settings from '@/models/Settings';
import { ensureDashboardAuth } from '../../_auth';
import { generateAIContent, buildDraftPrompt, parseAIResponse } from '@/lib/outreach-ai';

export async function POST(request: NextRequest) {
  const authError = ensureDashboardAuth();
  if (authError) return authError;

  try {
    await connectDB();

    const body = await request.json();
    const { contactId, companyId, jobTitle, jobDescription, tone, selectedProjectIds, selectedSkillIds } = body;

    if (!contactId || !companyId || !jobTitle) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields: contactId, companyId, jobTitle' },
        { status: 400 }
      );
    }

    // Fetch contact and company
    const [contactRaw, companyRaw] = await Promise.all([
      OutreachContact.findById(contactId).lean(),
      OutreachCompany.findById(companyId).lean(),
    ]);

    if (!contactRaw || !companyRaw) {
      return NextResponse.json(
        { success: false, error: 'Contact or company not found' },
        { status: 404 }
      );
    }

    interface ContactData {
      name: string;
    }
    interface CompanyData {
      name: string;
    }

    const contact = contactRaw as unknown as ContactData;
    const company = companyRaw as unknown as CompanyData;

    interface SettingsData {
      fullName: string;
      bio: string;
    }

    // Fetch settings for portfolio context
    const settingsDoc = await Settings.findOne().lean();
    if (!settingsDoc) {
      return NextResponse.json(
        { success: false, error: 'Settings not found' },
        { status: 404 }
      );
    }
    const settings = settingsDoc as unknown as SettingsData;

    // Fetch selected projects or fallback to featured published projects
    let projects: any[] = [];
    if (selectedProjectIds && selectedProjectIds.length > 0) {
      projects = await Project.find({ _id: { $in: selectedProjectIds }, status: 'published' }).lean();
    } else {
      projects = await Project.find({ status: 'published', featured: true })
        .sort({ order: 1 })
        .limit(3)
        .lean();
    }

    // Fetch selected skills or fallback to featured skills
    let skills: any[] = [];
    if (selectedSkillIds && selectedSkillIds.length > 0) {
      skills = await Skill.find({ _id: { $in: selectedSkillIds } }).lean();
    } else {
      skills = await Skill.find({ featured: true }).sort({ order: 1 }).limit(10).lean();
    }

    // Build portfolio context
    const portfolioContext = {
      name: settings.fullName,
      bio: settings.bio,
      projects: projects.map((p: any) => ({
        title: p.title,
        shortDescription: p.shortDescription,
        technologies: p.technologies?.map((t: any) => t.name) || [],
      })),
      skills: skills.map((s: any) => s.name),
    };

    // Generate AI draft
    const prompt = buildDraftPrompt({
      contactName: contact.name,
      companyName: company.name,
      jobTitle,
      jobDescription,
      tone: tone || 'professional',
      portfolioContext,
    });

    const aiResponse = await generateAIContent(prompt);
    const { subject, body: emailBody } = parseAIResponse(aiResponse);

    // Save draft
    const draft = await OutreachDraft.create({
      contactId,
      companyId,
      intent: jobDescription ? 'post_application' : 'cold',
      tone: tone || 'professional',
      jobTitle,
      jobDescription,
      selectedProjectIds: projects.map((p: any) => p._id),
      selectedSkillIds: skills.map((s: any) => s._id),
      subject,
      body: emailBody,
      modelUsed: 'gemini-pro',
    });

    return NextResponse.json({
      success: true,
      data: {
        _id: draft._id.toString(),
        contactId: draft.contactId.toString(),
        companyId: draft.companyId.toString(),
        subject: draft.subject,
        body: draft.body,
        createdAt: draft.createdAt,
      },
    });
  } catch (error) {
    console.error('AI draft generation error:', error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Failed to generate draft' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  const authError = ensureDashboardAuth();
  if (authError) return authError;

  try {
    await connectDB();

    const contactId = request.nextUrl.searchParams.get('contactId');
    const companyId = request.nextUrl.searchParams.get('companyId');

    const query: any = {};
    if (contactId) query.contactId = contactId;
    if (companyId) query.companyId = companyId;

    const drafts = await OutreachDraft.find(query)
      .sort({ createdAt: -1 })
      .limit(20)
      .lean();

    const data = drafts.map((d: any) => ({
      _id: d._id.toString(),
      contactId: d.contactId.toString(),
      companyId: d.companyId.toString(),
      intent: d.intent,
      tone: d.tone,
      jobTitle: d.jobTitle,
      subject: d.subject,
      body: d.body,
      createdAt: d.createdAt,
    }));

    return NextResponse.json({ success: true, data });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Failed to fetch drafts' },
      { status: 500 }
    );
  }
}
