import mongoose, { Document } from 'mongoose';

// Define interfaces for nested objects
interface BlogStats {
  views: {
    total: number;
    unique: number;
    history: Array<{
      date: Date;
      count: number;
    }>;
  };
  likes: {
    total: number;
    users: string[];
    history: Array<{
      date: Date;
      count: number;
    }>;
  };
  comments: {
    total: number;
    approved: number;
    pending: number;
    spam: number;
  };
  shares: {
    total: number;
    platforms: {
      facebook: number;
      twitter: number;
      linkedin: number;
    };
  };
}

// Define interface for the document
interface IBlog extends Document {
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  category: string;
  tags: string[];
  coverImage?: string;
  coverImageId?: string;
  author: {
    name: string;
    bio?: string;
    avatar?: string;
  };
  readTime?: number;
  featured: boolean;
  status: 'draft' | 'published';
  publishedAt?: Date;
  stats: BlogStats;
  metaTitle?: string;
  metaDescription?: string;
  canonicalUrl?: string;
  noIndex: boolean;
  structuredData?: any;
  createdAt: Date;
  updatedAt: Date;
  addView: () => Promise<void>;
  toggleLike: (userEmail: string) => Promise<boolean>;
  updateCommentCount: (oldStatus?: string, newStatus?: string) => Promise<void>;
}

const blogSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Title is required'],
    trim: true,
  },
  slug: {
    type: String,
    unique: true,
    sparse: true,
  },
  excerpt: {
    type: String,
    required: [true, 'Excerpt is required'],
    maxlength: [300, 'Excerpt cannot be more than 300 characters'],
  },
  content: {
    type: String,
    required: [true, 'Content is required'],
  },
  category: {
    type: String,
    required: [true, 'Category is required'],
    trim: true,
  },
  tags: [{
    type: String,
    trim: true,
  }],
  coverImage: {
    type: String,
    required: false,
  },
  coverImageId: String,
  author: {
    name: {
      type: String,
      required: [true, 'Author name is required'],
    },
    bio: String,
    avatar: String,
  },
  readTime: {
    type: Number,
    required: false,
  },
  featured: {
    type: Boolean,
    default: false,
  },
  status: {
    type: String,
    enum: ['draft', 'published'],
    default: 'draft',
  },
  publishedAt: {
    type: Date,
    required: false,
  },
  stats: {
    views: {
      total: { type: Number, default: 0 },
      unique: { type: Number, default: 0 },
      history: [{
        date: { type: Date },
        count: { type: Number }
      }]
    },
    likes: {
      total: { type: Number, default: 0 },
      users: [{ type: String }],
      history: [{
        date: { type: Date },
        count: { type: Number }
      }]
    },
    comments: {
      total: { type: Number, default: 0 },
      approved: { type: Number, default: 0 },
      pending: { type: Number, default: 0 },
      spam: { type: Number, default: 0 }
    },
    shares: {
      total: { type: Number, default: 0 },
      platforms: {
        facebook: { type: Number, default: 0 },
        twitter: { type: Number, default: 0 },
        linkedin: { type: Number, default: 0 }
      }
    }
  },
  metaTitle: { type: String },
  metaDescription: { type: String },
  canonicalUrl: { type: String },
  noIndex: { type: Boolean, default: false },
  structuredData: { type: mongoose.Schema.Types.Mixed },
}, {
  timestamps: true,
});

// Add indexes for better query performance
blogSchema.index({ status: 1, createdAt: -1 });
blogSchema.index({ tags: 1 });
blogSchema.index({ category: 1 });
blogSchema.index({ 'stats.views.total': -1 });
blogSchema.index({ 'stats.likes.total': -1 });
blogSchema.index({ 'stats.comments.total': -1 });

// Virtual field for estimated reading time
blogSchema.virtual('readingTime').get(function() {
  const wordsPerMinute = 200;
  const wordCount = this.content.split(/\s+/).length;
  return Math.ceil(wordCount / wordsPerMinute);
});

// Function to generate slug from title
function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

// Instance methods
blogSchema.methods.addView = async function(this: IBlog): Promise<void> {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  this.stats.views.total += 1;

  const todayStats = this.stats.views.history.find(
    (h) => h.date.getTime() === today.getTime()
  );

  if (todayStats) {
    todayStats.count += 1;
  } else {
    this.stats.views.history.push({ date: today, count: 1 });
  }

  await this.save();
};

blogSchema.methods.toggleLike = async function(this: IBlog, userEmail: string): Promise<boolean> {
  const userLiked = this.stats.likes.users.includes(userEmail);
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  if (userLiked) {
    this.stats.likes.total -= 1;
    this.stats.likes.users = this.stats.likes.users.filter(email => email !== userEmail);
  } else {
    this.stats.likes.total += 1;
    this.stats.likes.users.push(userEmail);

    const todayStats = this.stats.likes.history.find(
      (h) => h.date.getTime() === today.getTime()
    );

    if (todayStats) {
      todayStats.count += 1;
    } else {
      this.stats.likes.history.push({ date: today, count: 1 });
    }
  }

  await this.save();
  return !userLiked;
};

type CommentStatus = 'approved' | 'pending' | 'spam';

function isValidCommentStatus(status: string): status is CommentStatus {
  return ['approved', 'pending', 'spam'].includes(status);
}

blogSchema.methods.updateCommentCount = async function(this: IBlog, oldStatus?: string, newStatus?: string): Promise<void> {
  if (oldStatus && isValidCommentStatus(oldStatus)) {
    this.stats.comments[oldStatus] -= 1;
  }
  if (newStatus && isValidCommentStatus(newStatus)) {
    this.stats.comments[newStatus] += 1;
  }
  this.stats.comments.total = 
    this.stats.comments.approved + 
    this.stats.comments.pending + 
    this.stats.comments.spam;
  
  await this.save();
};

// Pre-save middleware
blogSchema.pre('save', async function(this: IBlog) {
  if (!this.slug && this.title) {
    let slug = generateSlug(this.title);
    let counter = 0;
    let uniqueSlug = slug;
    
    while (await mongoose.models.Blog?.findOne({ slug: uniqueSlug })) {
      counter++;
      uniqueSlug = `${slug}-${counter}`;
    }
    
    this.slug = uniqueSlug;
  }

  if (this.isModified('content')) {
    const wordCount = this.content.split(/\s+/).length;
    this.readTime = Math.ceil(wordCount / 200);
  }

  if (this.status === 'published' && !this.publishedAt) {
    this.publishedAt = new Date();
  }
});

const Blog = (mongoose.models.Blog || mongoose.model<IBlog>('Blog', blogSchema)) as mongoose.Model<IBlog>;

export default Blog; 