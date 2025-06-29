import mongoose, { Document, Schema } from 'mongoose';
import {
  ExperienceStatus,
  EmploymentType,
  ExperienceType,
  IWorkExperience as IWorkExperienceType,
  IEducation as IEducationType,
  DraftContent
} from '@/types/experience';

// Base interface for common fields
interface BaseExperience {
  title: string;
  organization: string;
  location: string;
  startDate: Date;
  endDate?: Date;
  isCurrent: boolean;
  description: string | DraftContent;
  order: number;
  featured: boolean;
  status: 'draft' | 'published';
}

// Work Experience interface with Document
export interface IWorkExperience extends Omit<IWorkExperienceType, '_id'>, Document {}

// Education interface with Document
export interface IEducation extends Omit<IEducationType, '_id'>, Document {}

// Validator for DraftContent
const isDraftContent = (value: string | DraftContent) => {
  if (typeof value === 'string') return true;
  if (typeof value === 'object' && value !== null) {
    return (
      'blocks' in value &&
      Array.isArray(value.blocks) &&
      'entityMap' in value &&
      typeof value.entityMap === 'object'
    );
  }
  return false;
};

// Common schema fields
const baseExperienceSchema = {
  title: {
    type: String,
    required: true,
    trim: true,
  },
  organization: {
    type: String,
    required: true,
    trim: true,
  },
  location: {
    type: String,
    required: true,
    trim: true,
  },
  startDate: {
    type: Date,
    required: true,
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
    type: Schema.Types.Mixed,
    required: true,
    validate: {
      validator: isDraftContent,
      message: 'Description must be either a string or a valid Draft.js content object'
    }
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
    enum: ['draft', 'published'] as ExperienceStatus[],
    default: 'published',
  },
  type: {
    type: String,
    enum: ['work', 'education'] as ExperienceType[],
    required: true,
  },
};

// Work Experience Schema
const workExperienceSchema = new Schema({
  ...baseExperienceSchema,
  type: {
    type: String,
    default: 'work' as ExperienceType,
    immutable: true,
  },
  jobTitle: {
    type: String,
    required: true,
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
    required: true,
    trim: true,
  },
  employmentType: {
    type: String,
    enum: ['full-time', 'part-time', 'contract', 'freelance', 'internship'] as EmploymentType[],
    required: true,
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
  toJSON: {
    transform: function(doc, ret) {
      ret._id = ret._id.toString();
      if (ret.startDate) ret.startDate = ret.startDate.toISOString();
      if (ret.endDate) ret.endDate = ret.endDate.toISOString();
      return ret;
    }
  }
});

// Education Schema
const educationSchema = new Schema({
  ...baseExperienceSchema,
  type: {
    type: String,
    default: 'education' as ExperienceType,
    immutable: true,
  },
  degree: {
    type: String,
    required: true,
    trim: true,
  },
  institution: {
    type: String,
    required: true,
    trim: true,
  },
  fieldOfStudy: {
    type: String,
    required: true,
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
      type: Schema.Types.Mixed,
      validate: {
        validator: isDraftContent,
        message: 'Thesis description must be either a string or a valid Draft.js content object'
      }
    },
    supervisor: {
      type: String,
      trim: true,
    },
  },
}, {
  timestamps: true,
  toJSON: {
    transform: function(doc, ret) {
      ret._id = ret._id.toString();
      if (ret.startDate) ret.startDate = ret.startDate.toISOString();
      if (ret.endDate) ret.endDate = ret.endDate.toISOString();
      return ret;
    }
  }
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

// Create and export the models
export const WorkExperience = mongoose.models.WorkExperience || mongoose.model<IWorkExperience>('WorkExperience', workExperienceSchema);
export const Education = mongoose.models.Education || mongoose.model<IEducation>('Education', educationSchema);
export default { WorkExperience, Education }; 