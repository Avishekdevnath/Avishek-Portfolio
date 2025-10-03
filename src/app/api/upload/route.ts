import { NextRequest } from 'next/server';
import { v2 as cloudinary } from 'cloudinary';
import { NextResponse } from 'next/server';
import { uploadImage, deleteImage } from '@/lib/cloudinary';

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true
});

// Helper function to check if a file is an image
function isImage(file: File): boolean {
  const imageTypes = [
    'image/jpeg',
    'image/png',
    'image/gif',
    'image/webp',
    'image/svg+xml',
    'image/bmp',
    'image/tiff',
    'image/x-icon',
    'image/vnd.microsoft.icon'
  ];
  return imageTypes.includes(file.type);
}

export async function POST(request: Request) {
  try {
    // Check if the request is multipart/form-data
    const contentType = request.headers.get('content-type');
    if (!contentType || !contentType.includes('multipart/form-data')) {
      return NextResponse.json({
        success: false,
        error: 'Request must be multipart/form-data'
      }, { status: 400 });
    }

    // Get the form data
    const formData = await request.formData();
    const file = formData.get('file');
    const folder = formData.get('folder') as string || 'portfolio/projects';
    const oldPublicId = formData.get('oldPublicId') as string;

    if (!file) {
      return NextResponse.json({
        success: false,
        error: 'No file provided'
      }, { status: 400 });
    }

    // Check if it's a File object
    if (!(file instanceof File)) {
      return NextResponse.json({
        success: false,
        error: 'Invalid file format'
      }, { status: 400 });
    }

    // Validate file type
    if (!isImage(file)) {
      return NextResponse.json({
        success: false,
        error: 'Invalid file type. Only image files are allowed'
      }, { status: 400 });
    }

    // Validate file size (10MB)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      return NextResponse.json({
        success: false,
        error: 'File size exceeds 10MB limit'
      }, { status: 400 });
    }

    // Convert File to Buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Delete old image if exists
    if (oldPublicId) {
      try {
        await deleteImage(oldPublicId);
      } catch (error) {
        // Continue with upload even if deletion fails
      }
    }

    // Upload to Cloudinary
    const result = await uploadImage(buffer, folder);

    if (!result || !result.url || !result.public_id) {
      throw new Error('Failed to upload image to Cloudinary');
    }

    // Return the image details
    return NextResponse.json({
      success: true,
      data: {
        url: result.url,
        public_id: result.public_id,
        format: result.format,
        width: result.width,
        height: result.height
      }
    });
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to upload file'
    }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const publicId = searchParams.get('publicId');

    if (!publicId) {
      return NextResponse.json({
        success: false,
        error: 'No public ID provided'
      }, { status: 400 });
    }

    const result = await deleteImage(publicId);

    if (!result || result.result !== 'ok') {
      return NextResponse.json({
        success: false,
        error: 'Failed to delete image'
      }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: 'Image deleted successfully'
    });
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to delete file'
    }, { status: 500 });
  }
}

// Add these new exports
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic'; 