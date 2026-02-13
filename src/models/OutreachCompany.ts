import mongoose, { Document, Schema } from 'mongoose';

export interface IOutreachCompany extends Document {
  name: string;
  nameLower: string;
  country: string;
  countryLower: string;
  website?: string;
  careerPageUrl?: string;
  tags: string[];
  notes?: string;
  starred: boolean;
  archived: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const urlValidator = (value: string) => {
  if (!value) return true;
  try {
    // eslint-disable-next-line no-new
    new URL(value);
    return true;
  } catch {
    return false;
  }
};

const outreachCompanySchema = new Schema<IOutreachCompany>(
  {
    name: {
      type: String,
      required: [true, 'Company name is required'],
      trim: true,
      maxlength: [200, 'Company name cannot be longer than 200 characters'],
    },
    nameLower: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },
    country: {
      type: String,
      required: [true, 'Country is required'],
      trim: true,
      maxlength: [100, 'Country cannot be longer than 100 characters'],
    },
    countryLower: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },
    website: {
      type: String,
      trim: true,
      validate: { validator: urlValidator, message: 'Invalid website URL' },
    },
    careerPageUrl: {
      type: String,
      trim: true,
      validate: { validator: urlValidator, message: 'Invalid career page URL' },
    },
    tags: {
      type: [String],
      default: [],
      set: (tags: string[]) =>
        Array.isArray(tags)
          ? tags.map((t) => String(t).trim()).filter(Boolean)
          : [],
    },
    notes: {
      type: String,
      trim: true,
      maxlength: [2000, 'Notes cannot be longer than 2000 characters'],
    },
    starred: {
      type: Boolean,
      default: false,
    },
    archived: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

// Compound unique index for name + country
outreachCompanySchema.index({ nameLower: 1, countryLower: 1 }, { unique: true });
outreachCompanySchema.index({ nameLower: 1 });
outreachCompanySchema.index({ countryLower: 1 });
outreachCompanySchema.index({ createdAt: -1 });
outreachCompanySchema.index({ starred: -1, createdAt: -1 });
outreachCompanySchema.index({ archived: 1, createdAt: -1 });

outreachCompanySchema.pre('validate', function preValidate(next) {
  if (this.name) {
    this.nameLower = this.name.trim().toLowerCase();
  }
  if (this.country) {
    this.countryLower = this.country.trim().toLowerCase();
  }
  next();
});

const OutreachCompany =
  mongoose.models.OutreachCompany ||
  mongoose.model<IOutreachCompany>('OutreachCompany', outreachCompanySchema);

export default OutreachCompany;

