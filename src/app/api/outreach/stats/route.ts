import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import OutreachCompany from '@/models/OutreachCompany';
import OutreachContact from '@/models/OutreachContact';
import OutreachEmail from '@/models/OutreachEmail';
import OutreachTemplate from '@/models/OutreachTemplate';
import { ensureDashboardAuth } from '../_auth';

export async function GET() {
  const authError = ensureDashboardAuth();
  if (authError) return authError;

  try {
    await connectDB();

    // Basic counts
    const [companies, contacts, emails, templates] = await Promise.all([
      OutreachCompany.find({}).lean(),
      OutreachContact.find({}).lean(),
      OutreachEmail.find({})
        .populate('contactId', 'name email')
        .populate('companyId', 'name')
        .populate('templateId', 'name')
        .lean(),
      OutreachTemplate.find({}).lean(),
    ]);

    const now = new Date();
    const followUpsDue = await OutreachEmail.countDocuments({
      status: 'sent',
      followUpDate: { $lte: now },
      followUpCount: { $lt: 2 },
    });

    // Transform emails for analytics
    const emailsData = emails.map((e: any) => ({
      _id: e._id.toString(),
      contactId: e.contactId?._id?.toString() || e.contactId?.toString(),
      companyId: e.companyId?._id?.toString() || e.companyId?.toString(),
      templateId: e.templateId?._id?.toString() || e.templateId?.toString(),
      subject: e.subject,
      body: e.body,
      status: e.status,
      sentAt: e.sentAt,
      followUpDate: e.followUpDate,
      followUpCount: e.followUpCount || 0,
      replyReceivedAt: e.replyReceivedAt,
      outcome: e.outcome,
      contact: e.contactId && typeof e.contactId === 'object'
        ? { _id: e.contactId._id.toString(), name: e.contactId.name, email: e.contactId.email }
        : undefined,
      company: e.companyId && typeof e.companyId === 'object'
        ? { _id: e.companyId._id.toString(), name: e.companyId.name }
        : undefined,
      template: e.templateId && typeof e.templateId === 'object'
        ? { _id: e.templateId._id.toString(), name: e.templateId.name }
        : undefined,
    }));

    // Companies data
    const companiesData = companies.map((c: any) => ({
      _id: c._id.toString(),
      name: c.name,
      country: c.country,
    }));

    // Templates data
    const templatesData = templates.map((t: any) => ({
      _id: t._id.toString(),
      name: t.name,
    }));

    return NextResponse.json({
      success: true,
      data: {
        companies: companiesData.length,
        contacts: contacts.length,
        emails: emailsData.length,
        followUpsDue,
        emailsList: emailsData,
        companiesList: companiesData,
        templates: templatesData,
      },
    });
  } catch {
    return NextResponse.json(
      { success: false, error: 'Failed to fetch outreach stats' },
      { status: 500 }
    );
  }
}
