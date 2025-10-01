import { Metadata } from 'next';
import { connectToDatabase } from '@/lib/mongodb';
import Blog from '@/models/Blog';
import { generateMetadata as generateSEOMetadata } from '@/components/shared/SEO';

interface BlogPostPageProps {
  params: {
    slug: string;
  };
}

export async function generateMetadata({ params }: BlogPostPageProps): Promise<Metadata> {
  await connectToDatabase();
  const blog = await Blog.findOne({ slug: params.slug }).lean();

  if (!blog) {
    return {
      title: 'Blog Post Not Found',
      description: 'The requested blog post could not be found.',
    };
  }

  return generateSEOMetadata({
    title: blog.title,
    description: blog.excerpt,
    image: blog.coverImage,
    url: `/blogs/${blog.slug}`,
    type: 'article',
    publishedTime: new Date(blog.createdAt).toISOString(),
    modifiedTime: new Date(blog.updatedAt).toISOString(),
    author: blog.author.name,
    tags: blog.tags,
  });
} 