import mongoose, { Document, Schema } from 'mongoose';

// Base interface for common fields
interface BaseExperience {
  title: string;
  organization: string;
  location: string;
  startDate: Date;
  endDate?: Date;
  isCurrent: boolean;
  description: string;
  order: number;
  featured: boolean;
  status: 'draft' | 'published';
}

// Work Experience interface
export interface IWorkExperience extends BaseExperience, Document {
  type: 'work';
  jobTitle?: string; // New field - main job title
  level?: string; // New field - position level
  position?: string; // Keep old field for backward compatibility
  company: string;
  employmentType: 'full-time' | 'part-time' | 'contract' | 'freelance' | 'internship';
  technologies: string[];
  achievements: string[];
  responsibilities: string[];
  website?: string;
  companySize?: string;
}

// Education interface
export interface IEducation extends BaseExperience, Document {
  type: 'education';
  degree: string;
  institution: string;
  fieldOfStudy: string;
  gpa?: number;
  maxGpa?: number;
  activities: string[];
  honors: string[];
  coursework: string[];
  thesis?: {
    title: string;
    description: string;
    supervisor: string;
  };
}

// Common schema fields
const baseExperienceSchema = {
  title: {
    type: String,
    required: [true, 'Title is required'],
    trim: true,
  },
  organization: {
    type: String,
    required: [true, 'Organization is required'],
    trim: true,
  },
  location: {
    type: String,
    required: [true, 'Location is required'],
    trim: true,
  },
  startDate: {
    type: Date,
    required: [true, 'Start date is required'],
  },
  endDate: {
    type: Date,
    required: false,
  },
  isCurrent: {
    type: Boolean,
    default: false,
  },
  description: {
    type: String,
    required: [true, 'Description is required'],
    maxlength: [1000, 'Description cannot exceed 1000 characters'],
  },
  order: {
    type: Number,
    default: 0,
  },
  featured: {
    type: Boolean,
    default: false,
  },
  status: {
    type: String,
    enum: ['draft', 'published'],
    default: 'published',
  },
};

// Work Experience Schema
const workExperienceSchema = new Schema({
  ...baseExperienceSchema,
  type: {
    type: String,
    default: 'work',
    immutable: true,
  },
  jobTitle: {
    type: String,
    trim: true,
  },
  level: {
    type: String,
    trim: true,
  },
  position: {
    type: String,
    trim: true,
  },
  company: {
    type: String,
    required: [true, 'Company is required'],
    trim: true,
  },
  employmentType: {
    type: String,
    enum: ['full-time', 'part-time', 'contract', 'freelance', 'internship'],
    required: [true, 'Employment type is required'],
  },
  technologies: [{
    type: String,
    trim: true,
  }],
  achievements: [{
    type: String,
    trim: true,
  }],
  responsibilities: [{
    type: String,
    trim: true,
  }],
  website: {
    type: String,
    trim: true,
  },
  companySize: {
    type: String,
    trim: true,
  },
}, {
  timestamps: true,
});

// Education Schema
const educationSchema = new Schema({
  ...baseExperienceSchema,
  type: {
    type: String,
    default: 'education',
    immutable: true,
  },
  degree: {
    type: String,
    required: [true, 'Degree is required'],
    trim: true,
  },
  institution: {
    type: String,
    required: [true, 'Institution is required'],
    trim: true,
  },
  fieldOfStudy: {
    type: String,
    required: [true, 'Field of study is required'],
    trim: true,
  },
  gpa: {
    type: Number,
    min: 0,
  },
  maxGpa: {
    type: Number,
    min: 0,
  },
  activities: [{
    type: String,
    trim: true,
  }],
  honors: [{
    type: String,
    trim: true,
  }],
  coursework: [{
    type: String,
    trim: true,
  }],
  thesis: {
    title: {
      type: String,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    supervisor: {
      type: String,
      trim: true,
    },
  },
}, {
  timestamps: true,
});

// Add indexes for better performance
workExperienceSchema.index({ status: 1, order: 1 });
workExperienceSchema.index({ featured: 1, startDate: -1 });
workExperienceSchema.index({ company: 1 });

educationSchema.index({ status: 1, order: 1 });
educationSchema.index({ featured: 1, startDate: -1 });
educationSchema.index({ institution: 1 });

// Virtual for formatted date range
workExperienceSchema.virtual('dateRange').get(function() {
  const start = this.startDate.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
  const end = this.isCurrent ? 'Present' : this.endDate?.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
  return `${start} - ${end}`;
});

educationSchema.virtual('dateRange').get(function() {
  const start = this.startDate.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
  const end = this.isCurrent ? 'Present' : this.endDate?.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
  return `${start} - ${end}`;
});

// Ensure virtual fields are serialized
workExperienceSchema.set('toJSON', { virtuals: true });
educationSchema.set('toJSON', { virtuals: true });

// Create models
const WorkExperience = mongoose.models.WorkExperience || mongoose.model<IWorkExperience>('WorkExperience', workExperienceSchema);
const Education = mongoose.models.Education || mongoose.model<IEducation>('Education', educationSchema);

export { WorkExperience, Education };
export default { WorkExperience, Education }; 