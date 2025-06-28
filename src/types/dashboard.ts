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
export interface ITechnology {
  name: string;
  icon?: string;
}

export interface IRepository {
  name: string;
  url: string;
  type: 'github' | 'gitlab' | 'bitbucket' | 'other';
}

export interface IDemoURL {
  name: string;
  url: string;
}

export interface Project {
  _id: string;
  title: string;
  description: string;
  shortDescription: string;
  category: string;
  technologies: ITechnology[];
  repositories: IRepository[];
  demoUrls: IDemoURL[];
  image: string;
  imagePublicId: string;
  completionDate: string;
  featured: boolean;
  status: 'draft' | 'published';
  createdAt?: string;
  updatedAt?: string;
  order?: number;
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