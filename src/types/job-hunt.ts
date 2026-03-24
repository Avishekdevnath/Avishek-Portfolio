import type {
  ActivityType,
  ApplicationStatus,
  ContactStatus,
  FollowUpDoneOption,
  InterviewResult,
  InterviewRound,
  InterviewType,
  JobType,
  LeadSource,
  LeadStatus,
  LocationType,
  PriorityLevel,
  ReferralOption,
  RelationshipType,
} from '@/lib/job-hunt-utils';

export interface JobApplicationItem {
  _id: string;
  company: string;
  jobTitle: string;
  jobUrl?: string;
  dateApplied: string;
  status: ApplicationStatus;
  jobType?: JobType;
  location?: string;
  salaryRange?: string;
  contactName?: string;
  contactEmail?: string;
  notes?: string;
  sourceLeadId?: string;
  daysSinceApplied: number;
  followUpAlert: 'None' | 'Follow up Soon' | 'Overdue';
  createdAt?: string;
  updatedAt?: string;
}

export interface JobLeadItem {
  _id: string;
  title: string;
  company: string;
  location?: string;
  jobType?: LocationType;
  source: LeadSource;
  jobUrl: string;
  status: LeadStatus;
  fitScore?: number;
  dateFound: string;
  dateApplied?: string;
  synced: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface PaginationData {
  total: number;
  page: number;
  limit: number;
  pages: number;
}

export interface JobActivityItem {
  _id: string;
  date: string;
  activityType: ActivityType;
  companyOrContact?: string;
  description?: string;
  timeSpentHours?: number;
  followUpDate?: string;
  followUpDone: FollowUpDoneOption;
  priority: PriorityLevel;
  createdAt?: string;
  updatedAt?: string;
}

export interface JobInterviewItem {
  _id: string;
  company: string;
  jobTitle: string;
  interviewRound: InterviewRound;
  interviewDate: string;
  interviewType: InterviewType;
  interviewers?: string;
  questionsAsked?: string;
  selfRating?: number;
  result: InterviewResult;
  nextSteps?: string;
  notes?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface JobContactItem {
  _id: string;
  name: string;
  company?: string;
  titleOrRole?: string;
  relationship: RelationshipType;
  contactInfo?: string;
  lastContact?: string;
  nextFollowUp?: string;
  referredYou: ReferralOption;
  notes?: string;
  status: ContactStatus;
  createdAt?: string;
  updatedAt?: string;
}

export interface JobHuntAnalyticsSummary {
  totalApplications: number;
  statusCounts: Record<string, number>;
  followUp: {
    dueSoon: number;
    overdue: number;
  };
  monthlyResponseRate: Array<{
    month: string;
    applied: number;
    responses: number;
    responseRate: number;
    interviews: number;
    interviewRate: number;
  }>;
  weeklySummary: {
    applications: number;
    responses: number;
    interviews: number;
    offers: number;
  };
  monthlySummary: {
    applications: number;
    responses: number;
    interviews: number;
    offers: number;
  };
}
