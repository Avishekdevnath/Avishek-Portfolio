import { NextRequest, NextResponse } from 'next/server';
import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true
});

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('video') as File;

    if (!file) {
      return NextResponse.json({ success: false, error: 'No video file provided' }, { status: 400 });
    }

    // Validate file type (basic)
    const allowedTypes = ['video/mp4', 'video/webm', 'video/quicktime', 'video/x-matroska'];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json({ success: false, error: 'Invalid video type' }, { status: 400 });
    }

    // Validate size (100MB limit)
    const maxSize = 100 * 1024 * 1024; // 100 MB
    if (file.size > maxSize) {
      return NextResponse.json({ success: false, error: 'Video exceeds 100MB size limit' }, { status: 400 });
    }

    // Convert file to Buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Convert file to base64 string
    const base64 = buffer.toString('base64');

    const uploadResult = await cloudinary.uploader.upload(`data:${file.type};base64,${base64}`, {
      folder: 'portfolio/blogs/content',
      resource_type: 'video',
      chunk_size: 6000000 // 6MB chunks for large upload
    });

    return NextResponse.json({ success: true, url: uploadResult.secure_url, public_id: uploadResult.public_id });
  } catch (error) {
    return NextResponse.json({ success: false, error: error instanceof Error ? error.message : 'Failed to upload video' }, { status: 500 });
  }
} 