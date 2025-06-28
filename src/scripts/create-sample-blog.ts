import { connectToDatabase } from '../lib/mongodb';
import Blog from '../models/Blog';

async function createSampleBlog() {
  try {
    await connectToDatabase();
    
    const sampleBlog = new Blog({
      title: 'Building a Modern Portfolio with Next.js and TypeScript',
      slug: 'building-a-modern-portfolio-with-next-js',
      excerpt: 'A comprehensive guide to creating a professional portfolio website using Next.js, React, and MongoDB',
      content: `
        <h1>Introduction</h1>
        <p>This is a detailed guide about building modern portfolio websites. We'll cover everything from setup to deployment, including:</p>
        
        <ol>
          <li>Setting up Next.js</li>
          <li>Designing the UI</li>
          <li>Implementing MongoDB</li>
          <li>Adding Authentication</li>
          <li>Creating a Blog System</li>
          <li>Deploying to Production</li>
        </ol>
        
        <h2>Getting Started</h2>
        <p>First, let's create a new Next.js project with TypeScript support...</p>
        
        <blockquote>
          <p>This is where you can test adding images! Click the image button in the toolbar above to upload images directly into your blog content.</p>
        </blockquote>
        
        <h3>Project Setup</h3>
        <p>We'll start by initializing our project with the latest technologies...</p>
      `,
      category: 'Web Development',
      tags: ['Next.js', 'TypeScript', 'React', 'MongoDB', 'Portfolio'],
      author: {
        name: 'Admin',
        email: 'admin@example.com',
        bio: 'Full-stack developer passionate about modern web technologies',
        social: {
          twitter: 'https://twitter.com/yourhandle',
          linkedin: 'https://linkedin.com/in/yourprofile',
          github: 'https://github.com/yourusername'
        }
      },
      status: 'draft',
      featured: true,
      publishedAt: new Date(),
      createdAt: new Date(),
      updatedAt: new Date()
    });

    await sampleBlog.save();
    console.log('✅ Sample blog post created successfully!');
    console.log('📝 Title:', sampleBlog.title);
    console.log('🔗 Slug:', sampleBlog.slug);
    console.log('🆔 ID:', sampleBlog._id);
    
  } catch (error) {
    console.error('❌ Error creating sample blog:', error);
  } finally {
    process.exit(0);
  }
}

createSampleBlog(); 