import mongoose, { Schema, Document, Model } from 'mongoose';

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

export interface ProjectImage {
  url: string;
  publicId: string;
  caption?: string;
  altText?: string;
}

export interface Project extends Document {
  title: string;
  description: string;
  shortDescription: string;
  category: string;
  technologies: Technology[];
  repositories: Repository[];
  demoUrls: DemoURL[];
  image: string;
  imagePublicId: string;
  additionalImages?: ProjectImage[];
  completionDate: Date;
  featured: boolean;
  status: 'draft' | 'published';
  order: number;
  createdAt: Date;
  updatedAt: Date;
}

const technologySchema = new Schema<Technology>({
  name: { 
    type: String, 
    required: [true, 'Technology name is required'],
    trim: true
  },
  icon: { 
    type: String,
    trim: true
  }
});

const repositorySchema = new Schema<Repository>({
  name: { 
    type: String, 
    required: [true, 'Repository name is required'],
    trim: true
  },
  url: {
    type: String,
    required: [true, 'Repository URL is required'],
    trim: true,
    validate: {
      validator: (value: string) => {
        try {
          new URL(value);
          return true;
        } catch {
          return false;
        }
      },
      message: 'Invalid URL format'
    }
  },
  type: {
    type: String,
    required: [true, 'Repository type is required'],
    enum: {
      values: ['github', 'gitlab', 'bitbucket', 'other'],
      message: 'Invalid repository type'
    }
  }
});

const demoUrlSchema = new Schema<DemoURL>({
  name: { 
    type: String, 
    required: [true, 'Demo name is required'],
    trim: true
  },
  url: {
    type: String,
    required: [true, 'Demo URL is required'],
    trim: true,
    validate: {
      validator: (value: string) => {
        try {
          new URL(value);
          return true;
        } catch {
          return false;
        }
      },
      message: 'Invalid URL format'
    }
  },
  type: {
    type: String,
    required: [true, 'Demo type is required'],
    enum: {
      values: ['live', 'staging', 'demo', 'documentation'],
      message: 'Invalid demo type'
    }
  }
});

const projectImageSchema = new Schema<ProjectImage>({
  url: {
    type: String,
    required: [true, 'Image URL is required'],
    trim: true,
    validate: {
      validator: (value: string) => {
        try {
          new URL(value);
          return true;
        } catch {
          return false;
        }
      },
      message: 'Invalid image URL format'
    }
  },
  publicId: {
    type: String,
    required: [true, 'Image public ID is required'],
    trim: true
  },
  caption: {
    type: String,
    trim: true,
    maxlength: [200, 'Caption cannot be longer than 200 characters']
  },
  altText: {
    type: String,
    trim: true,
    maxlength: [100, 'Alt text cannot be longer than 100 characters']
  }
});

const projectSchema = new Schema<Project>({
  title: {
    type: String,
    required: [true, 'Title is required'],
    trim: true,
    maxlength: [100, 'Title cannot be longer than 100 characters'],
    index: true
  },
  description: {
    type: String,
    required: [true, 'Description is required'],
    trim: true,
    maxlength: [5000, 'Description cannot be longer than 5000 characters']
  },
  shortDescription: {
    type: String,
    required: [true, 'Short description is required'],
    trim: true,
    maxlength: [150, 'Short description cannot be longer than 150 characters']
  },
  category: {
    type: String,
    required: [true, 'Category is required'],
    enum: {
      values: [
        'Web Development',
        'Mobile Development',
        'Desktop Development',
        'NPM Package',
        'Python Package (pip)',
        'Library/Package',
        'Chrome Extension',
        'VS Code Extension',
        'CLI Tool',
        'Machine Learning',
        'Artificial Intelligence',
        'Data Science',
        'Data Engineering',
        'DevOps',
        'Cloud Computing',
        'Cyber Security',
        'Blockchain',
        'Game Development',
        'IoT',
        'Embedded Systems',
        'Computer Vision',
        'Natural Language Processing',
        'Robotics',
        'Augmented Reality',
        'Virtual Reality',
        'API Development',
        'Automation',
        'WordPress Plugin',
        'Browser Extension',
        'Other'
      ],
      message: 'Invalid category'
    },
    index: true
  },
  technologies: {
    type: [technologySchema],
    required: true,
    validate: {
      validator: (value: Technology[]) => value.length > 0,
      message: 'At least one technology is required',
    },
  },
  repositories: {
    type: [repositorySchema],
    required: true,
    validate: {
      validator: (value: Repository[]) => value.length > 0,
      message: 'At least one repository is required',
    },
  },
  demoUrls: {
    type: [demoUrlSchema],
    default: [],
  },
  image: {
    type: String,
    required: [true, 'Project image is required'],
    trim: true,
    validate: {
      validator: (value: string) => {
        try {
          new URL(value);
          return true;
        } catch {
          return false;
        }
      },
      message: 'Invalid image URL format'
    }
  },
  imagePublicId: {
    type: String,
    required: [true, 'Image public ID is required'],
    trim: true
  },
  additionalImages: {
    type: [projectImageSchema],
    default: [],
    validate: {
      validator: (value: ProjectImage[]) => value.length <= 10,
      message: 'Cannot have more than 10 additional images'
    }
  },
  completionDate: {
    type: Date,
    required: false,
    default: null,
    index: true
  },
  featured: {
    type: Boolean,
    default: false,
    index: true
  },
  status: {
    type: String,
    enum: {
      values: ['draft', 'published'],
      message: 'Invalid status'
    },
    default: 'draft',
    required: true,
    index: true
  },
  order: {
    type: Number,
    default: 0,
    index: true
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for common queries
projectSchema.index({ createdAt: -1 });
projectSchema.index({ updatedAt: -1 });
projectSchema.index({ status: 1, featured: 1 });
projectSchema.index({ 'technologies.name': 1 });
projectSchema.index({ order: 1, createdAt: -1 });

// Virtual for project URL
projectSchema.virtual('url').get(function(this: Project) {
  return `/projects/${this._id}`;
});

// Pre-save middleware to ensure order is set
projectSchema.pre('save', async function(this: Project & { constructor: Model<Project> }) {
  if (this.isNew && !this.order) {
    const lastProject = await this.constructor.findOne().sort({ order: -1 });
    this.order = lastProject ? lastProject.order + 1 : 0;
  }
});

// Ensure old images are deleted when project is deleted
projectSchema.pre('deleteOne', { document: true }, async function(this: Project) {
  if (this.imagePublicId) {
    const { deleteImage } = await import('@/lib/cloudinary');
    await deleteImage(this.imagePublicId);
  }
  
  // Delete additional images
  if (this.additionalImages && this.additionalImages.length > 0) {
    const { deleteImage } = await import('@/lib/cloudinary');
    for (const img of this.additionalImages) {
      if (img.publicId) {
        await deleteImage(img.publicId);
      }
    }
  }
});

// Create text index for search
projectSchema.index({
  title: 'text',
  shortDescription: 'text',
  description: 'text',
  'technologies.name': 'text'
}, {
  weights: {
    title: 10,
    shortDescription: 5,
    'technologies.name': 3,
    description: 1
  }
});

// Create the model
const Project = mongoose.models.Project || mongoose.model<Project>('Project', projectSchema);

export default Project; 