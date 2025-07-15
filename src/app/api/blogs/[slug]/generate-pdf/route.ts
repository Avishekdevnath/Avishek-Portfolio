import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import Blog from '@/models/Blog';
import puppeteer from 'puppeteer';

export async function POST(request: NextRequest, { params }: { params: { slug: string } }) {
  try {
    await connectToDatabase();

    const blog = await Blog.findOne({ slug: params.slug });
    if (!blog) {
      return NextResponse.json({ error: 'Blog not found' }, { status: 404 });
    }

    // Launch Puppeteer
    const browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    const page = await browser.newPage();
    
    // Create HTML content for PDF
    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8">
          <title>${blog.title}</title>
          <style>
            body {
              font-family: Arial, sans-serif;
              line-height: 1.6;
              color: #333;
              max-width: 800px;
              margin: 0 auto;
              padding: 20px;
            }
            .header {
              border-bottom: 3px solid #007bff;
              padding-bottom: 20px;
              margin-bottom: 30px;
            }
            .title {
              font-size: 28px;
              font-weight: bold;
              color: #2c3e50;
              margin-bottom: 10px;
            }
            .meta {
              color: #666;
              font-size: 14px;
              margin-bottom: 10px;
            }
            .tags {
              margin-top: 10px;
            }
            .tag {
              display: inline-block;
              background: #e9ecef;
              color: #495057;
              padding: 4px 8px;
              border-radius: 12px;
              font-size: 12px;
              margin-right: 5px;
            }
            .content {
              margin-top: 30px;
            }
            .content h1, .content h2, .content h3 {
              color: #2c3e50;
              margin-top: 25px;
              margin-bottom: 15px;
            }
            .content img {
              max-width: 100%;
              height: auto;
              border-radius: 8px;
              margin: 20px 0;
            }
            .content blockquote {
              border-left: 4px solid #007bff;
              padding-left: 15px;
              margin: 20px 0;
              font-style: italic;
              background: #f8f9fa;
              padding: 15px;
              border-radius: 4px;
            }
            .content code {
              background: #f1f3f4;
              padding: 2px 4px;
              border-radius: 3px;
              font-family: 'Courier New', monospace;
            }
            .content pre {
              background: #2d3748;
              color: #e2e8f0;
              padding: 15px;
              border-radius: 8px;
              overflow-x: auto;
            }
            .footer {
              margin-top: 50px;
              padding-top: 20px;
              border-top: 1px solid #dee2e6;
              text-align: center;
              color: #6c757d;
              font-size: 12px;
            }
          </style>
        </head>
        <body>
          <div class="header">
            <div class="title">${blog.title}</div>
            <div class="meta">
              <strong>Author:</strong> ${blog.author.name}<br>
              <strong>Published:</strong> ${new Date(blog.createdAt).toLocaleDateString()}<br>
              <strong>Category:</strong> ${blog.category}
            </div>
            ${blog.tags?.length > 0 ? `
              <div class="tags">
                ${blog.tags.map(tag => `<span class="tag">#${tag}</span>`).join('')}
              </div>
            ` : ''}
          </div>
          
          <div class="content">
            ${blog.content}
          </div>
          
          <div class="footer">
            Generated from Avishek's Portfolio Blog - ${new Date().toLocaleDateString()}
          </div>
        </body>
      </html>
    `;

    await page.setContent(htmlContent, { waitUntil: 'networkidle0' });
    
    // Generate PDF
    const pdfBuffer = await page.pdf({
      format: 'A4',
      printBackground: true,
      margin: {
        top: '20mm',
        right: '15mm',
        bottom: '20mm',
        left: '15mm'
      }
    });

    await browser.close();

    // Return PDF
    return new NextResponse(pdfBuffer, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${blog.slug}.pdf"`
      }
    });

  } catch (error) {
    console.error('Error generating PDF:', error);
    return NextResponse.json(
      { error: 'Failed to generate PDF' },
      { status: 500 }
    );
  }
} 