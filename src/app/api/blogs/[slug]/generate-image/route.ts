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
    
    // Set viewport for image generation
    await page.setViewport({ width: 1200, height: 630 });
    
    // Create HTML content for social media image
    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8">
          <style>
            * {
              margin: 0;
              padding: 0;
              box-sizing: border-box;
            }
            body {
              width: 1200px;
              height: 630px;
              background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
              font-family: 'Arial', sans-serif;
              display: flex;
              align-items: center;
              justify-content: center;
              position: relative;
              overflow: hidden;
            }
            .container {
              background: rgba(255, 255, 255, 0.95);
              backdrop-filter: blur(10px);
              border-radius: 20px;
              padding: 60px;
              width: 90%;
              max-width: 1000px;
              text-align: center;
              box-shadow: 0 25px 50px rgba(0, 0, 0, 0.2);
            }
            .title {
              font-size: 48px;
              font-weight: bold;
              color: #2c3e50;
              margin-bottom: 20px;
              line-height: 1.2;
              max-height: 200px;
              overflow: hidden;
            }
            .excerpt {
              font-size: 20px;
              color: #7f8c8d;
              margin-bottom: 30px;
              line-height: 1.5;
              max-height: 120px;
              overflow: hidden;
            }
            .meta {
              display: flex;
              justify-content: space-between;
              align-items: center;
              margin-bottom: 20px;
            }
            .author {
              font-size: 18px;
              color: #34495e;
              font-weight: 600;
            }
            .date {
              font-size: 16px;
              color: #95a5a6;
            }
            .tags {
              display: flex;
              justify-content: center;
              flex-wrap: wrap;
              gap: 10px;
              margin-top: 20px;
            }
            .tag {
              background: linear-gradient(45deg, #3498db, #9b59b6);
              color: white;
              padding: 8px 16px;
              border-radius: 20px;
              font-size: 14px;
              font-weight: 500;
            }
            .stats {
              display: flex;
              justify-content: center;
              gap: 30px;
              margin-top: 25px;
              font-size: 14px;
              color: #7f8c8d;
            }
            .stat {
              display: flex;
              align-items: center;
              gap: 5px;
            }
            .branding {
              position: absolute;
              bottom: 20px;
              right: 30px;
              font-size: 16px;
              color: rgba(255, 255, 255, 0.8);
              font-weight: 600;
            }
            .decoration {
              position: absolute;
              top: -50px;
              left: -50px;
              width: 200px;
              height: 200px;
              background: rgba(255, 255, 255, 0.1);
              border-radius: 50%;
            }
            .decoration2 {
              position: absolute;
              bottom: -100px;
              right: -100px;
              width: 300px;
              height: 300px;
              background: rgba(255, 255, 255, 0.05);
              border-radius: 50%;
            }
          </style>
        </head>
        <body>
          <div class="decoration"></div>
          <div class="decoration2"></div>
          
          <div class="container">
            <div class="meta">
              <div class="author">By ${blog.author.name}</div>
              <div class="date">${new Date(blog.createdAt).toLocaleDateString()}</div>
            </div>
            
            <div class="title">${blog.title}</div>
            
            ${blog.excerpt ? `<div class="excerpt">${blog.excerpt}</div>` : ''}
            
            ${blog.tags?.length > 0 ? `
              <div class="tags">
                ${blog.tags.slice(0, 4).map(tag => `<span class="tag">#${tag}</span>`).join('')}
              </div>
            ` : ''}
            
            <div class="stats">
              <div class="stat">📖 ${blog.readTime || Math.ceil(blog.content.split(/\\s+/).length / 200)} min read</div>
              <div class="stat">📂 ${blog.category}</div>
            </div>
          </div>
          
          <div class="branding">Avishek's Portfolio</div>
        </body>
      </html>
    `;

    await page.setContent(htmlContent, { waitUntil: 'networkidle0' });
    
    // Generate screenshot
    const imageBuffer = await page.screenshot({
      type: 'png',
      quality: 90,
      fullPage: false
    });

    await browser.close();

    // Return image
    return new NextResponse(imageBuffer, {
      headers: {
        'Content-Type': 'image/png',
        'Content-Disposition': `attachment; filename="${blog.slug}-preview.png"`
      }
    });

  } catch (error) {
    console.error('Error generating image:', error);
    return NextResponse.json(
      { error: 'Failed to generate image' },
      { status: 500 }
    );
  }
} 