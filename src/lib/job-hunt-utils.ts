export const APPLICATION_STATUSES = [
  'Applied',
  'Phone Screen',
  'Interview',
  'Offer',
  'Rejected',
  'No Response'
] as const;

export const JOB_TYPES = [
  'Full-time',
  'Part-time',
  'Contract',
  'Freelance'
] as const;

export const LOCATION_TYPES = [
  'Remote',
  'Onsite',
  'Hybrid',
  'Other'
] as const;

export const LEAD_STATUSES = [
  'New',
  'Applied',
  'Interviewing',
  'Skipped',
  'Saved'
] as const;

export const LEAD_SOURCES = [
  'Remotive',
  'Arbeitnow',
  'Himalayas',
  'WeWorkRemotely'
] as const;

export type ApplicationStatus = (typeof APPLICATION_STATUSES)[number];
export type JobType = (typeof JOB_TYPES)[number];
export type LocationType = (typeof LOCATION_TYPES)[number];
export type LeadStatus = (typeof LEAD_STATUSES)[number];
export type LeadSource = (typeof LEAD_SOURCES)[number];

export const ACTIVITY_TYPES = [
  'Job Application',
  'Phone Screen',
  'Interview Prep',
  'Interview',
  'Follow-up Email',
  'Networking',
  'Research',
  'Resume Update',
  'Cover Letter',
  'LinkedIn Update',
  'Referral Request',
  'Thank You Note',
  'Offer Review',
  'Other',
] as const;

export const PRIORITY_LEVELS = ['High', 'Medium', 'Low'] as const;

export const FOLLOW_UP_DONE_OPTIONS = ['Yes', 'No', 'N/A'] as const;

export const INTERVIEW_ROUNDS = [
  'Round 1 - Phone Screen',
  'Round 2 - Technical',
  'Round 3 - HR',
  'Round 4 - Manager',
  'Round 5 - Panel',
  'Final Round',
  'Take-home Assignment',
] as const;

export const INTERVIEW_TYPES = [
  'Phone Call',
  'Video Call',
  'In-Person',
  'Technical',
  'Panel',
  'Case Study',
  'Behavioral',
] as const;

export const INTERVIEW_RESULTS = [
  'Pending',
  'Passed',
  'Failed',
  'Offer Extended',
  'No Show',
  'Cancelled',
] as const;

export const RELATIONSHIP_TYPES = [
  'Recruiter',
  'Hiring Manager',
  'Former Colleague',
  'Friend',
  'Alumni',
  'Mentor',
  'Industry Contact',
  'Referral',
  'LinkedIn Connection',
  'Other',
] as const;

export const CONTACT_STATUSES = ['Active', 'Warm', 'Cold', 'Referred', 'Closed'] as const;

export const REFERRAL_OPTIONS = ['Yes', 'No', 'Pending'] as const;

// Company Store enums
export const COMPANY_TIERS = ['Dream', 'Target', 'Safe'] as const;

// HR Store enums
export const HR_ROLE_TITLES = ['HR', 'Recruiter', 'Hiring Manager'] as const;
export const HR_CONTACT_STATUSES = ['New', 'Contacted', 'Replied', 'Closed'] as const;

export type CompanyTier = (typeof COMPANY_TIERS)[number];
export type HRRoleTitle = (typeof HR_ROLE_TITLES)[number];
export type HRContactStatus = (typeof HR_CONTACT_STATUSES)[number];

export type FollowUpAlert = 'None' | 'Follow up Soon' | 'Overdue';
export type ActivityType = (typeof ACTIVITY_TYPES)[number];
export type PriorityLevel = (typeof PRIORITY_LEVELS)[number];
export type FollowUpDoneOption = (typeof FOLLOW_UP_DONE_OPTIONS)[number];
export type InterviewRound = (typeof INTERVIEW_ROUNDS)[number];
export type InterviewType = (typeof INTERVIEW_TYPES)[number];
export type InterviewResult = (typeof INTERVIEW_RESULTS)[number];
export type RelationshipType = (typeof RELATIONSHIP_TYPES)[number];
export type ContactStatus = (typeof CONTACT_STATUSES)[number];
export type ReferralOption = (typeof REFERRAL_OPTIONS)[number];

export function normalizeDedupValue(value: string): string {
  return value.trim().toLowerCase().replace(/\s+/g, ' ');
}

export function daysSince(dateInput: Date | string): number {
  const appliedDate = typeof dateInput === 'string' ? new Date(dateInput) : dateInput;
  const now = new Date();
  const diffMs = now.getTime() - appliedDate.getTime();
  return Math.max(0, Math.floor(diffMs / (1000 * 60 * 60 * 24)));
}

export function getFollowUpAlert(status: ApplicationStatus, daysSinceApplied: number): FollowUpAlert {
  if (status !== 'Applied') return 'None';
  if (daysSinceApplied >= 14) return 'Overdue';
  if (daysSinceApplied >= 7) return 'Follow up Soon';
  return 'None';
}

export interface BuildApplicationFromLeadInput {
  company: string;
  title: string;
  jobUrl: string;
  dateApplied: Date;
  sourceLeadId: string;
  location?: string;
}

export function buildApplicationFromLead(input: BuildApplicationFromLeadInput) {
  return {
    company: input.company,
    jobTitle: input.title,
    jobUrl: input.jobUrl,
    dateApplied: input.dateApplied,
    status: 'Applied' as const,
    sourceLeadId: input.sourceLeadId,
    location: input.location || undefined,
  };
}
