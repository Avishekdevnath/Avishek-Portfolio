// Common types
export type ExperienceStatus = 'draft' | 'published';
export type EmploymentType = 'full-time' | 'part-time' | 'contract' | 'freelance' | 'internship';
export type ExperienceType = 'work' | 'education';

// Draft.js content type
export interface DraftContent {
  blocks: Array<{
    key?: string;
    text: string;
    type: string;
    depth: number;
    inlineStyleRanges: Array<{
      offset: number;
      length: number;
      style: string;
    }>;
    entityRanges: Array<{
      offset: number;
      length: number;
      key: number;
    }>;
    data: Record<string, unknown>;
  }>;
  entityMap: Record<string, unknown>;
}

// Base interface for common fields
export interface BaseExperience {
  _id?: string;
  title: string;
  organization: string;
  location: string;
  startDate: string | Date;
  endDate?: string | Date | null;
  isCurrent: boolean;
  description: string | DraftContent;
  order: number;
  featured: boolean;
  status: ExperienceStatus;
  type: ExperienceType;
}

// Work Experience interface
export interface IWorkExperience extends BaseExperience {
  type: 'work';
  jobTitle: string;
  level?: string;
  position?: string; // Keep old field for backward compatibility
  company: string;
  employmentType: EmploymentType;
  technologies: string[];
  achievements: string[];
  responsibilities: string[];
  website?: string;
  companySize?: string;
}

// Education interface
export interface IEducation extends BaseExperience {
  type: 'education';
  degree: string;
  institution: string;
  fieldOfStudy: string;
  gpa?: number | null;
  maxGpa?: number | null;
  activities: string[];
  honors: string[];
  coursework: string[];
  thesis?: {
    title: string;
    description: string | DraftContent;
    supervisor: string;
  } | null;
}

// Form data interface
export interface ExperienceFormData extends Omit<BaseExperience, '_id' | 'type'> {
  // Common fields are inherited from BaseExperience
  
  // Work-specific fields
  jobTitle?: string;
  level?: string;
  company?: string;
  employmentType?: EmploymentType;
  technologies?: string[];
  achievements?: string[];
  responsibilities?: string[];
  website?: string;
  companySize?: string;
  
  // Education-specific fields
  degree?: string;
  institution?: string;
  fieldOfStudy?: string;
  gpa?: number | string | null;
  maxGpa?: number | string | null;
  activities?: string[];
  honors?: string[];
  coursework?: string[];
  thesis?: {
    title: string;
    description: string | DraftContent;
    supervisor: string;
  } | null;
}

// API Response interfaces
export interface ExperienceApiResponse {
  success: boolean;
  data?: IWorkExperience | IEducation;
  error?: string;
}

export interface ExperienceListApiResponse {
  success: boolean;
  data?: {
    // Combined format (from /api/experience)
    work?: IWorkExperience[];
    education?: IEducation[];
    summary?: {
      totalWork: number;
      totalEducation: number;
      featuredWork: number;
      featuredEducation: number;
    };
    // Single type format (from /api/experience/work or /api/experience/education)
    experiences?: (IWorkExperience | IEducation)[];
    pagination?: {
      total: number;
      page: number;
      limit: number;
      pages: number;
    };
  };
  error?: string;
} 