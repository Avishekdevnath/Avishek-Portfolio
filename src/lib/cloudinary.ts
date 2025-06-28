'use server';

import { v2 as cloudinary } from 'cloudinary';

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
  
  const transformations = [];
  
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

    let uploadOptions: any = {
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
    console.error('Error uploading image to Cloudinary:', error);
    throw error;
  }
}

// Delete image from Cloudinary
export async function deleteImage(publicId: string) {
  try {
    if (!publicId) {
      throw new Error('No public ID provided');
    }

    const result = await cloudinary.uploader.destroy(publicId, {
      resource_type: 'auto',
      invalidate: true
    });

    return result;
  } catch (error) {
    console.error('Error deleting image from Cloudinary:', error);
    throw error;
  }
}

// Generate optimized image URL with transformations
export async function generateImageUrl(publicId: string, options: any = {}) {
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
    console.error('Error generating Cloudinary URL:', error);
    throw error;
  }
}

// Helper function to detect MIME type from buffer
async function detectMimeType(buffer: Buffer): Promise<string> {
  // Check for image signatures
  if (buffer.length < 4) return 'application/octet-stream';

  const signatures: { [key: string]: number[] } = {
    'image/jpeg': [0xFF, 0xD8, 0xFF],
    'image/png': [0x89, 0x50, 0x4E, 0x47],
    'image/gif': [0x47, 0x49, 0x46],
    'image/webp': [0x52, 0x49, 0x46, 0x46],
    'image/svg+xml': [0x3C, 0x3F, 0x78, 0x6D],
    'image/bmp': [0x42, 0x4D],
    'image/tiff': [0x49, 0x49, 0x2A, 0x00],
    'image/x-icon': [0x00, 0x00, 0x01, 0x00]
  };

  for (const [mimeType, signature] of Object.entries(signatures)) {
    if (signature.every((byte, i) => buffer[i] === byte)) {
      return mimeType;
    }
  }

  // Default to jpeg if no match found
  return 'image/jpeg';
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
    console.error('Error getting image info:', error);
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
    console.error('Error updating image transformations:', error);
    throw error;
  }
}

// Validate image file
export async function validateImage(file: any) {
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
    console.error('Error validating image:', error);
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
    console.error('Error getting image dimensions:', error);
    throw error;
  }
} 