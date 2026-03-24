import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import { ResumeVariant } from '@/models/ResumeVariant';

export async function GET(request: NextRequest, { params }: { params: { slug: string } }) {
  try {
    await connectDB();

    // Find the public resume variant by slug
    const variant: any =
      (await ResumeVariant.findOne({ slug: params.slug, publicViewEnabled: true, status: 'ready' })) ||
      (await ResumeVariant.findOne({ slugHistory: params.slug, publicViewEnabled: true, status: 'ready' }));

    if (!variant || !variant.fileUrl) {
      console.error('❌ Resume not found:', {
        slug: params.slug,
        variantExists: !!variant,
        fileUrlExists: variant?.fileUrl ? true : false,
        status: variant?.status,
      });
      return NextResponse.json({ error: 'Resume not found' }, { status: 404 });
    }

    // Fetch the PDF from Vercel Blob
    const pdfResponse = await fetch(variant.fileUrl);
    
    if (!pdfResponse.ok) {
      console.error('❌ Failed to fetch PDF from Blob:', {
        slug: params.slug,
        status: pdfResponse.status,
        statusText: pdfResponse.statusText,
        blobUrl: variant.fileUrl?.substring(0, 50) + '...',
      });
      return NextResponse.json({ error: 'Unable to fetch PDF' }, { status: 500 });
    }

    const pdfBuffer = await pdfResponse.arrayBuffer();
    
    console.log('✅ PDF fetched successfully:', {
      slug: params.slug,
      fileName: variant.fileName,
      size: pdfBuffer.byteLength,
    });
    
    // Check if download parameter is set
    const isDownload = request.nextUrl.searchParams.get('download') === '1';
    
    const headers: Record<string, string> = {
      'Content-Type': 'application/pdf',
      'Cache-Control': 'public, max-age=3600', // Cache for 1 hour
      'Content-Length': pdfBuffer.byteLength.toString(),
    };

    // Only set attachment header for downloads, use inline for viewing
    if (isDownload) {
      headers['Content-Disposition'] = `attachment; filename="${variant.fileName || 'resume.pdf'}"`;
    } else {
      headers['Content-Disposition'] = `inline; filename="${variant.fileName || 'resume.pdf'}"`;
    }

    // Return the PDF with proper headers
    return new NextResponse(pdfBuffer, {
      status: 200,
      headers,
    });
  } catch (error) {
    console.error('Error serving PDF:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
