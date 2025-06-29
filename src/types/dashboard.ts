// Skill Types
export const skillLevels = ["Basic", "Intermediate", "Experienced", "Expert"] as const;
export type SkillLevel = typeof skillLevels[number];

export interface Skill {
  name: string;
  level: SkillLevel;
  details: string;
}

export interface SkillCategory {
  category: string;
  skills: Skill[];
}

// Experience Types
export interface WorkExperience {
  title: string;
  company: string;
  location: string;
  type: string;
  period: string;
  description: string;
  technologies: string[];
}

export interface Education {
  degree: string;
  institution: string;
  location: string;
  period: string;
  description: string;
  achievements: string[];
}

export interface ExperienceData {
  work: WorkExperience[];
  education: Education[];
}

// Project Types
export interface Technology {
  name: string;
  icon?: string;
}

export interface Repository {
  name: string;
  url: string;
  type: 'github' | 'gitlab' | 'bitbucket' | 'other';
}

export interface DemoURL {
  name: string;
  url: string;
  type: 'live' | 'staging' | 'demo' | 'documentation';
}

export interface Project {
  _id: string;
  title: string;
  description: string;
  shortDescription: string;
  category: string;
  technologies: Technology[];
  repositories: Repository[];
  demoUrls: DemoURL[];
  image: string;
  imagePublicId: string;
  completionDate: string | Date;
  featured: boolean;
  status: 'draft' | 'published';
  order: number;
  createdAt: string | Date;
  updatedAt: string | Date;
}

export interface ProjectApiResponse {
  success: boolean;
  data?: Project;
  error?: string;
}

export interface ProjectListApiResponse {
  success: boolean;
  data?: {
    projects: Project[];
    pagination?: {
      total: number;
      page: number;
      limit: number;
      pages: number;
    };
  };
  error?: string;
}

// Blog Types
export interface BlogPost {
  id: string;
  title: string;
  excerpt: string;
  content: string;
  category: string;
  date: string;
}

export interface Category {
  name: string;
  count: number;
}

// Message Types
export interface Message {
  id: number;
  name: string;
  email: string;
  subject: string;
  message: string;
  date: string;
  isStarred: boolean;
  isRead: boolean;
} 