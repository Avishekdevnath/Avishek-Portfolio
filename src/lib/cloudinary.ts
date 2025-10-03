'use server';

import { v2 as cloudinary } from 'cloudinary';
import { detectMimeType } from './mime';

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true
});

// Default upload preset for projects
const UPLOAD_PRESET = 'portfolio_projects';

interface UploadResponse {
  public_id: string;
  secure_url: string;
  format: string;
  width: number;
  height: number;
}

interface UploadOptions {
  folder: string;
  resource_type: 'auto' | 'image' | 'video' | 'raw';
  allowed_formats: string[];
  transformation: Array<Record<string, string>>;
  file?: string;
}

interface ImageFile {
  size: number;
  type: string;
}

// Helper function to get Cloudinary URL without requiring the full package
export const getImageUrl = (publicIdOrUrl: string, options: { width?: number; height?: number; quality?: string } = {}) => {
  if (!publicIdOrUrl) return '/placeholder-project.svg';
  
  // If it's already a full URL, check if it's a Cloudinary URL
  if (publicIdOrUrl.startsWith('http')) {
    if (publicIdOrUrl.includes('res.cloudinary.com')) {
      // Extract public ID from URL
      const matches = publicIdOrUrl.match(/upload\/(?:v\d+\/)?(.+)$/);
      if (matches && matches[1]) {
        publicIdOrUrl = matches[1].split('.')[0]; // Remove file extension
      } else {
        return publicIdOrUrl;
      }
    } else {
      return publicIdOrUrl;
    }
  }
  
  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
  if (!cloudName) return publicIdOrUrl;
  
  const transformations: string[] = [];
  
  // Add default transformations first
  transformations.push('f_auto', 'q_auto:good');
  
  // Add custom transformations
  if (options.width) transformations.push(`w_${options.width}`);
  if (options.height) transformations.push(`h_${options.height}`);
  if (options.quality) transformations.push(`q_${options.quality}`);
  
  const transformationString = transformations.length > 0 
    ? `/${transformations.join(',')}` 
    : '';
  
  // Remove any leading 'v' numbers and file extensions from the public ID
  const cleanPublicId = publicIdOrUrl.replace(/^v\d+\//, '').replace(/\.[^/.]+$/, '');
  
  return `https://res.cloudinary.com/${cloudName}/image/upload${transformationString}/${cleanPublicId}`;
};

// Initialize Cloudinary
export async function initCloudinary() {
  return cloudinary;
}

// Upload image to Cloudinary
export async function uploadImage(file: string | Buffer, folder: string = 'portfolio/projects') {
  try {
    if (!file) {
      throw new Error('No file provided');
    }

    let uploadOptions: UploadOptions = {
      folder,
      resource_type: 'auto',
      allowed_formats: ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg', 'bmp', 'ico', 'tiff'],
      transformation: [
        { quality: 'auto:good' },
        { fetch_format: 'auto' }
      ]
    };

    // If file is a Buffer, convert to base64
    if (Buffer.isBuffer(file)) {
      const base64Data = file.toString('base64');
      const mimeType = await detectMimeType(file);
      uploadOptions.file = `data:${mimeType};base64,${base64Data}`;
    } else {
      uploadOptions.file = file;
    }

    const result = await cloudinary.uploader.upload(uploadOptions.file, uploadOptions);

    return {
      url: result.secure_url,
      public_id: result.public_id,
      format: result.format,
      resource_type: result.resource_type,
      bytes: result.bytes,
      width: result.width,
      height: result.height
    };
  } catch (error) {
    // Error uploading image to Cloudinary
    throw error;
  }
}

// Delete image from Cloudinary
export async function deleteImage(publicId: string) {
  try {
    if (!publicId) {
      throw new Error('No public ID provided');
    }

    // Try deleting as image first (most common case)
    let result = await cloudinary.uploader.destroy(publicId, {
      resource_type: 'image',
      invalidate: true
    });

    // If not found as image, try as raw
    if (result.result === 'not found') {
      result = await cloudinary.uploader.destroy(publicId, {
        resource_type: 'raw',
        invalidate: true
      });
    }

    return result;
  } catch (error) {
    // Error deleting image from Cloudinary
    throw error;
  }
}

// Generate optimized image URL with transformations
export async function generateImageUrl(publicId: string, options: Record<string, string | number | boolean> = {}) {
  try {
    if (!publicId) {
      throw new Error('No public ID provided');
    }

    const defaultOptions = {
      quality: 'auto:best',
      fetch_format: 'auto',
      dpr: 'auto',
      responsive: true,
      width: 'auto',
      crop: 'scale',
      format: 'auto'
    };

    const finalOptions = { ...defaultOptions, ...options };
    return cloudinary.url(publicId, finalOptions);
  } catch (error) {
    // Error generating Cloudinary URL
    throw error;
  }
}

// Validate image file
export async function validateImage(file: ImageFile) {
  try {
    if (!file) {
      throw new Error('No file provided');
    }

    // Check file size (5MB limit)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      throw new Error('File size exceeds 5MB limit');
    }

    // Check file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      throw new Error('Invalid file type. Only JPG, PNG, GIF, and WebP are allowed');
    }

    return true;
  } catch (error) {
    // Error validating image
    throw error;
  }
}

// Get image information
export async function getImageInfo(publicId: string) {
  try {
    if (!publicId) {
      throw new Error('No public ID provided');
    }

    const result = await cloudinary.api.resource(publicId, {
      colors: true,
      image_metadata: true,
      quality_analysis: true
    });

    return {
      format: result.format,
      resource_type: result.resource_type,
      bytes: result.bytes,
      width: result.width,
      height: result.height,
      colors: result.colors,
      predominant_color: result.predominant?.google?.[0],
      metadata: result.image_metadata,
      quality_score: result.quality_analysis?.quality_score
    };
  } catch (error) {
    // Error getting image info
    throw error;
  }
}

// Update image transformations
export async function updateImageTransformations(publicId: string, options: any = {}) {
  try {
    if (!publicId) {
      throw new Error('No public ID provided');
    }

    const defaultOptions = {
      quality: 'auto:best',
      fetch_format: 'auto',
      dpr: 'auto',
      responsive: true,
      width: 'auto',
      crop: 'scale',
      format: 'auto'
    };

    const finalOptions = { ...defaultOptions, ...options };
    return cloudinary.url(publicId, finalOptions);
  } catch (error) {
    // Error updating image transformations
    throw error;
  }
}

// Get image dimensions
export async function getImageDimensions(publicId: string) {
  try {
    if (!publicId) {
      throw new Error('No public ID provided');
    }

    const result = await cloudinary.api.resource(publicId);
    return {
      width: result.width,
      height: result.height
    };
  } catch (error) {
    // Error getting image dimensions
    throw error;
  }
} 