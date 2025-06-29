import mongoose, { Schema, Document } from 'mongoose';

export interface ISocialLink {
  platform: 'website' | 'github' | 'linkedin' | 'twitter' | 'instagram' | 'youtube';
  url: string;
}

export interface IContactInfo {
  email: string;
  phone: string;
  location: string;
  responseTime: string;
}

export interface ISettings extends Document {
  userId: string;
  profileImage?: string;
  fullName: string;
  bio: string;
  contactInfo: IContactInfo;
  socialLinks: ISocialLink[];
  websiteSettings: {
    siteTitle: string;
    metaDescription: string;
    enableDarkMode: boolean;
  };
  updatedAt: Date;
}

const SocialLinkSchema = new Schema<ISocialLink>({
  platform: {
    type: String,
    required: true,
    enum: ['website', 'github', 'linkedin', 'twitter', 'instagram', 'youtube']
  },
  url: {
    type: String,
    required: true
  }
});

const ContactInfoSchema = new Schema<IContactInfo>({
  email: {
    type: String,
    required: true
  },
  phone: {
    type: String,
    required: true
  },
  location: {
    type: String,
    required: true
  },
  responseTime: {
    type: String,
    required: true,
    default: 'Within 24 hours'
  }
});

const SettingsSchema = new Schema<ISettings>({
  userId: {
    type: String,
    required: true,
    unique: true
  },
  profileImage: String,
  fullName: {
    type: String,
    required: true
  },
  bio: {
    type: String,
    required: true
  },
  contactInfo: {
    type: ContactInfoSchema,
    required: true
  },
  socialLinks: {
    type: [SocialLinkSchema],
    default: []
  },
  websiteSettings: {
    siteTitle: {
      type: String,
      required: true,
      default: 'My Portfolio'
    },
    metaDescription: {
      type: String,
      required: true,
      default: 'Welcome to my portfolio website'
    },
    enableDarkMode: {
      type: Boolean,
      default: false
    }
  }
}, {
  timestamps: true
});

export default mongoose.models.Settings || mongoose.model<ISettings>('Settings', SettingsSchema); 