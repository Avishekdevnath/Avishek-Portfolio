import { NextRequest } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import Blog from '@/models/Blog';
import { handleApiError, sendSuccess, sendError } from '@/lib/api-utils';

// Function to generate slug from title
function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

// GET /api/blogs - Get all blogs
export async function GET(request: NextRequest) {
  try {
    await connectToDatabase();
    
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const search = searchParams.get('search') || '';
    const category = searchParams.get('category') || '';
    const tag = searchParams.get('tag') || '';
    const status = searchParams.get('status') || 'published';
    const featured = searchParams.get('featured') || '';
    const sortBy = searchParams.get('sortBy') || 'publishedAt';
    const sortOrder = searchParams.get('sortOrder') || 'desc';
    
    // Build query
    const query: any = { status };
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { excerpt: { $regex: search, $options: 'i' } },
        { content: { $regex: search, $options: 'i' } },
      ];
    }
    if (category) {
      query.category = category;
    }
    if (tag) {
      query.tags = tag;
    }
    if (featured) {
      query.featured = featured === 'true';
    }

    // Execute query with pagination
    const skip = (page - 1) * limit;
    
    // Build sort object
    const sort: any = {};
    sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

    const [blogs, total] = await Promise.all([
      Blog.find(query)
        .sort(sort)
        .skip(skip)
        .limit(limit)
        .select('-content'), // Exclude content field for list view
      Blog.countDocuments(query),
    ]);

    // Ensure all blogs have initialized stats
    const blogsWithStats = blogs.map(blog => {
      const blogObject = blog.toObject();
      if (!blogObject.stats) {
        blogObject.stats = {
          views: { total: 0, unique: 0, history: [] },
          likes: { total: 0, users: [], history: [] },
          comments: { total: 0, approved: 0, pending: 0, spam: 0 },
          shares: { total: 0, platforms: { facebook: 0, twitter: 0, linkedin: 0 } }
        };
      }
      return blogObject;
    });

    // Get unique categories and tags
    const [categories, tags] = await Promise.all([
      Blog.distinct('category'),
      Blog.distinct('tags'),
    ]);

    return sendSuccess({
      blogs: blogsWithStats,
      metadata: {
        categories,
        tags,
      },
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    return handleApiError(error);
  }
}

// POST /api/blogs - Create a new blog
export async function POST(request: NextRequest) {
  try {
    console.log('=== BLOG API CREATE DEBUG ===');
    await connectToDatabase();
    console.log('Database connected successfully');
    
    const body = await request.json();
    console.log('Request body:', JSON.stringify(body, null, 2));
    
    // Validate required fields
    const requiredFields = ['title', 'excerpt', 'content', 'category', 'author.name'];
    const missingFields = requiredFields.filter(field => {
      const value = field.split('.').reduce((obj, key) => obj?.[key], body);
      console.log(`Checking field ${field}:`, value);
      return !value;
    });
    
    console.log('Missing fields:', missingFields);
    
    if (missingFields.length > 0) {
      return sendError(`Missing required fields: ${missingFields.join(', ')}`, 400);
    }

    // Generate initial slug from title
    let baseSlug = generateSlug(body.title);
    let slug = baseSlug;
    let counter = 0;

    // Check for existing slugs and append counter if needed
    while (await Blog.findOne({ slug })) {
      counter++;
      slug = `${baseSlug}-${counter}`;
    }

    // Add slug to body
    body.slug = slug;
    console.log('Generated slug:', slug);

    // Set publishedAt date if status is published
    if (body.status === 'published' && !body.publishedAt) {
      body.publishedAt = new Date();
    }

    // Calculate read time
    const wordCount = body.content.split(/\s+/).length;
    body.readTime = Math.ceil(wordCount / 200);
    console.log('Calculated read time:', body.readTime);

    // Create new blog
    console.log('Creating blog with data:', JSON.stringify(body, null, 2));
    const blog = await Blog.create(body);
    console.log('Blog created successfully:', blog._id);
    
    return sendSuccess(blog, 'Blog post created successfully');
  } catch (error) {
    console.error('=== BLOG API ERROR ===');
    console.error('Error details:', error);
    console.error('Error type:', typeof error);
    console.error('Error constructor:', error?.constructor?.name);
    if (error.code === 11000 && error.keyPattern?.slug) {
      return sendError('A blog post with this title already exists', 400);
    }
    return handleApiError(error);
  }
} 