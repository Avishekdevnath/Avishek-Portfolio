import mongoose, { Schema, Document, Model } from 'mongoose';

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
  type: 'live' | 'staging' | 'demo' | 'documentation';
}

export interface IProject extends Document {
  title: string;
  description: string;
  shortDescription: string;
  category: string;
  technologies: ITechnology[];
  repositories: IRepository[];
  demoUrls: IDemoURL[];
  image: string;
  imagePublicId: string;
  completionDate: Date;
  featured: boolean;
  status: 'draft' | 'published';
  order: number;
  createdAt: Date;
  updatedAt: Date;
}

const technologySchema = new Schema<ITechnology>({
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

const repositorySchema = new Schema<IRepository>({
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

const demoUrlSchema = new Schema<IDemoURL>({
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

const projectSchema = new Schema<IProject>({
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
        'Machine Learning',
        'Data Science',
        'DevOps',
        'Blockchain',
        'Game Development',
        'IoT',
        'Other'
      ],
      message: 'Invalid category'
    },
    index: true
  },
  technologies: {
    type: [technologySchema],
    required: [true, 'At least one technology is required'],
    validate: {
      validator: (value: ITechnology[]) => value.length > 0,
      message: 'At least one technology is required'
    }
  },
  repositories: {
    type: [repositorySchema],
    required: [true, 'At least one repository is required'],
    validate: {
      validator: (value: IRepository[]) => value.length > 0,
      message: 'At least one repository is required'
    }
  },
  demoUrls: {
    type: [demoUrlSchema],
    default: []
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
  completionDate: {
    type: Date,
    required: [true, 'Completion date is required'],
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
projectSchema.virtual('url').get(function(this: IProject) {
  return `/projects/${this._id}`;
});

// Pre-save middleware to ensure order is set
projectSchema.pre('save', async function(this: IProject & { constructor: Model<IProject> }) {
  if (this.isNew && !this.order) {
    const lastProject = await this.constructor.findOne().sort({ order: -1 });
    this.order = lastProject ? lastProject.order + 1 : 0;
  }
});

// Ensure old image is deleted when project is deleted
projectSchema.pre('deleteOne', { document: true }, async function(this: IProject) {
  if (this.imagePublicId) {
    const { deleteImage } = await import('@/lib/cloudinary');
    await deleteImage(this.imagePublicId);
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
const Project = mongoose.models.Project || mongoose.model<IProject>('Project', projectSchema);

export default Project; 