export type OutreachContactStatus = 'new' | 'contacted' | 'replied' | 'closed';
export type OutreachEmailStatus = 'sent' | 'replied' | 'no_response' | 'closed';
export type OutreachTemplateType = 'cold' | 'follow_up' | 'referral' | 'post_application';
export type OutreachTone = 'professional' | 'friendly';

export interface OutreachCompany {
  _id: string;
  name: string;
  country: string;
  website?: string;
  careerPageUrl?: string;
  tags?: string[];
  notes?: string;
  starred?: boolean;
  archived?: boolean;
  createdAt: string | Date;
  updatedAt: string | Date;
}

export interface OutreachContact {
  _id: string;
  companyId: string;
  company?: { _id: string; name: string };
  name: string;
  email: string;
  roleTitle?: string;
  linkedinUrl?: string;
  status: OutreachContactStatus;
  lastContactedAt?: string | Date;
  notes?: string;
  createdAt: string | Date;
  updatedAt: string | Date;
}

export interface OutreachTemplate {
  _id: string;
  name: string;
  type: OutreachTemplateType;
  tone: OutreachTone;
  subjectTemplate: string;
  bodyTemplate: string;
  variables: string[];
  createdAt: string | Date;
  updatedAt: string | Date;
}

export type OutreachReplyOutcome = 'positive' | 'neutral' | 'rejection';

export interface OutreachEmail {
  _id: string;
  contactId: string;
  companyId: string;
  contact?: { _id: string; name: string; email?: string };
  company?: { _id: string; name: string };
  templateId?: string;
  subject: string;
  body: string;
  status: OutreachEmailStatus;
  sentAt: string | Date;
  followUpDate?: string | Date;
  followUpCount: number;
  replyReceivedAt?: string | Date;
  outcome?: OutreachReplyOutcome;
  replyNote?: string;
  closedAt?: string | Date;
  createdAt: string | Date;
  updatedAt: string | Date;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export type OutreachDraftIntent = 'cold' | 'post_application' | 'follow_up';

export interface OutreachDraft {
  _id: string;
  contactId: string;
  companyId: string;
  intent: OutreachDraftIntent;
  tone: OutreachTone;
  jobTitle?: string;
  jobDescription?: string;
  subject: string;
  body: string;
  modelUsed?: string;
  createdAt: string | Date;
}

