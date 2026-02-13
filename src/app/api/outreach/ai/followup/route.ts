import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import OutreachContact from '@/models/OutreachContact';
import OutreachCompany from '@/models/OutreachCompany';
import OutreachEmail from '@/models/OutreachEmail';
import OutreachDraft from '@/models/OutreachDraft';
import Settings from '@/models/Settings';
import { ensureDashboardAuth } from '../../_auth';
import { generateAIContent, buildFollowUpPrompt, parseAIResponse } from '@/lib/outreach-ai';

export async function POST(request: NextRequest) {
  const authError = ensureDashboardAuth();
  if (authError) return authError;

  try {
    await connectDB();

    const body = await request.json();
    const { emailId, tone } = body;

    if (!emailId) {
      return NextResponse.json(
        { success: false, error: 'Missing required field: emailId' },
        { status: 400 }
      );
    }

    // Fetch the original email
    const email = await OutreachEmail.findById(emailId).lean();
    if (!email) {
      return NextResponse.json(
        { success: false, error: 'Email not found' },
        { status: 404 }
      );
    }

    interface SettingsData {
      fullName: string;
      bio: string;
      outreachSettings?: {
        maxFollowUps?: number;
        defaultFollowUpGapDays?: number;
      };
    }

    interface EmailData {
      followUpCount: number;
      subject: string;
      body: string;
      contactId: { toString(): string };
      companyId: { toString(): string };
    }

    // Check follow-up count
    const settingsDoc = await Settings.findOne().lean();
    if (!settingsDoc) {
      return NextResponse.json(
        { success: false, error: 'Settings not found' },
        { status: 404 }
      );
    }
    const settingsData = settingsDoc as unknown as SettingsData;
    const maxFollowUps = settingsData.outreachSettings?.maxFollowUps || 2;

    const emailDoc = email as unknown as EmailData;
    if (emailDoc.followUpCount >= maxFollowUps) {
      return NextResponse.json(
        { success: false, error: `Maximum follow-ups (${maxFollowUps}) reached` },
        { status: 400 }
      );
    }

    // Fetch contact and company
    const [contactRaw, companyRaw] = await Promise.all([
      OutreachContact.findById(emailDoc.contactId).lean(),
      OutreachCompany.findById(emailDoc.companyId).lean(),
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

    const followUpNumber = (emailDoc.followUpCount || 0) + 1;

    // Generate AI follow-up
    const prompt = buildFollowUpPrompt({
      contactName: contact.name,
      companyName: company.name,
      originalSubject: emailDoc.subject,
      originalBody: emailDoc.body,
      followUpNumber,
      tone: tone || 'professional',
      portfolioContext: {
        name: settingsData.fullName,
        bio: settingsData.bio,
      },
    });

    const aiResponse = await generateAIContent(prompt);
    const { subject, body: followUpBody } = parseAIResponse(aiResponse);

    // Calculate suggested follow-up date
    const followUpGapDays = settingsData.outreachSettings?.defaultFollowUpGapDays || 7;
    const suggestedFollowUpDate = new Date();
    suggestedFollowUpDate.setDate(suggestedFollowUpDate.getDate() + followUpGapDays);

    // Save as draft
    const draft = await OutreachDraft.create({
      contactId: emailDoc.contactId,
      companyId: emailDoc.companyId,
      intent: 'follow_up',
      tone: tone || 'professional',
      jobTitle: '',
      subject,
      body: followUpBody,
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
        followUpNumber,
        suggestedFollowUpDate: suggestedFollowUpDate.toISOString(),
        createdAt: draft.createdAt,
      },
    });
  } catch (error) {
    console.error('AI follow-up generation error:', error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Failed to generate follow-up' },
      { status: 500 }
    );
  }
}
