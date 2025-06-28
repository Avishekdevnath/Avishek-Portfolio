import mongoose from 'mongoose';

// Clear existing model to avoid conflicts
if (mongoose.models.Comment) {
  delete mongoose.models.Comment;
}

const commentSchema = new mongoose.Schema({
  // New schema fields
  blogId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Blog',
    required: false, // Make it optional for migration
  },
  name: { 
    type: String, 
    required: false, // Make it optional for migration
    trim: true
  },
  email: { 
    type: String, 
    required: false,
    trim: true
  },
  content: { 
    type: String, 
    required: true,
    trim: true
  },
  
  // Legacy schema fields for backward compatibility
  blog: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Blog',
    required: false,
  },
  author: {
    name: { type: String, required: false },
    email: { type: String, required: false },
  },
  
  // Common fields
  status: {
    type: String,
    enum: ['pending', 'approved', 'spam'],
    default: 'approved',
  },
  parentComment: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Comment',
    default: null,
  },
  replies: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Comment',
  }],
  likes: { type: Number, default: 0 },
  isEdited: { type: Boolean, default: false },
}, {
  timestamps: true,
});

// Pre-save middleware to handle migration
commentSchema.pre('save', function(this: any) {
  // If using new schema but missing required fields, try to get from legacy fields
  if (!this.blogId && this.blog) {
    this.blogId = this.blog;
  }
  if (!this.name && this.author?.name) {
    this.name = this.author.name;
  }
  if (!this.email && this.author?.email) {
    this.email = this.author.email;
  }
  
  // Ensure at least one reference exists
  if (!this.blogId && !this.blog) {
    throw new Error('Blog reference is required');
  }
  if (!this.name && !this.author?.name) {
    throw new Error('Author name is required');
  }
});

// Add indexes for better query performance
commentSchema.index({ blogId: 1, createdAt: -1 });
commentSchema.index({ blog: 1, createdAt: -1 }); // Legacy index
commentSchema.index({ status: 1 });
commentSchema.index({ parentComment: 1 });

const Comment = mongoose.model('Comment', commentSchema);

export default Comment; 