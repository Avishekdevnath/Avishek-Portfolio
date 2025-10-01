import { Metadata } from 'next';
export const revalidate = 0;
import { notFound } from 'next/navigation';
import { connectToDatabase } from '@/lib/mongodb';
import Blog from '@/models/Blog';
import BlogStats from '@/models/BlogStats';
import CommentSection from '@/components/CommentSection';
import LikeButton from '@/components/LikeButton';
import ViewCounter from '@/components/ViewCounter';
import Header from '@/components/shared/Header';
import Footer from '@/components/shared/Footer';
import ShareButtons from '@/components/ShareButtons';
import { FaClock, FaEye, FaComment, FaHeart, FaTwitter, FaLinkedin, FaGithub, FaGlobe } from 'react-icons/fa';
import RichTextViewer from '@/components/shared/RichTextViewer';
import Comment from '@/models/Comment';
import { ArrowLeft } from 'lucide-react';

interface BlogPostPageProps {
  params: {
    slug: string;
  };
}

// Generate metadata for the page
export async function generateMetadata({ params }: BlogPostPageProps): Promise<Metadata> {
  await connectToDatabase();
  const blog = await Blog.findOne({ slug: params.slug });

  if (!blog) {
    return {
      title: 'Blog Post Not Found',
      description: 'The requested blog post could not be found.',
    };
  }

  const metadata: Metadata = {
    title: blog.metaTitle || blog.title,
    description: blog.metaDescription || blog.excerpt,
    openGraph: {
      title: blog.metaTitle || blog.title,
      description: blog.metaDescription || blog.excerpt,
      type: 'article',
      url: `/blogs/${blog.slug}`,
      images: blog.coverImage ? [blog.coverImage] : undefined,
      siteName: 'Avishek Portfolio',
      publishedTime: blog.publishedAt?.toISOString() || blog.createdAt.toISOString(),
      modifiedTime: blog.updatedAt.toISOString(),
      authors: [blog.author.name],
      tags: blog.tags,
    },
    twitter: {
      card: 'summary_large_image',
      title: blog.metaTitle || blog.title,
      description: blog.metaDescription || blog.excerpt,
      images: blog.coverImage ? [blog.coverImage] : undefined,
    },
    alternates: {
      canonical: blog.canonicalUrl,
    },
    robots: blog.noIndex ? 'noindex' : undefined,
  };

  return metadata;
}

export default async function BlogPostPage({ params }: BlogPostPageProps) {
  await connectToDatabase();
  const blog: any = await Blog.findOne({ slug: params.slug });

  if (!blog) {
    notFound();
  }

  // Fetch likes count from BlogStats collection
  const blogStatsDoc = await BlogStats.findOne({ blog: blog._id });
  const likesTotal = blogStatsDoc ? blogStatsDoc.likes.length : blog.stats?.likes?.total || 0;

  // Fetch comments count from Comment collection
  const commentsCount = await Comment.countDocuments({ blogId: blog._id });

  // Create share data for the blog post
  const shareData = {
    title: blog.title,
    description: blog.excerpt,
    url: `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/blogs/${blog.slug}`,
    image: blog.coverImage,
    tags: blog.tags,
    author: blog.author.name
  };

  // Server-side debug to confirm lineSpacing and data reaching page
  // eslint-disable-next-line no-console
  console.log('[PublicBlogPage] slug:', blog.slug, 'lineSpacing:', blog.lineSpacing);

  // Add structured data script
  const structuredData = blog.structuredData || {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    "headline": blog.metaTitle || blog.title,
    "description": blog.metaDescription || blog.excerpt,
    "author": {
      "@type": "Person",
      "name": blog.author.name,
      "url": blog.author.social?.website
    },
    "datePublished": blog.publishedAt || blog.createdAt.toISOString(),
    "dateModified": blog.updatedAt.toISOString(),
    "image": blog.coverImage,
    "publisher": {
      "@type": "Organization",
      "name": "Avishek Portfolio",
      "logo": {
        "@type": "ImageObject",
        "url": "/logo.png"
      }
    }
  };

  return (
    <>
      {/* Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />

      <div className="min-h-screen bg-white font-ui">
        <Header />
        
        {/* Hero Section with Cover Image */}
        {blog.coverImage && (
          <div className="relative h-[50vh] min-h-[300px] max-h-[500px] overflow-hidden">
            <img
              src={blog.coverImage}
              alt={blog.title}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-black/40"></div>
            <div className="absolute bottom-0 left-0 right-0 p-8 text-white">
              <div className="max-w-4xl mx-auto">
                <h1 className="text-h3 md:text-h2 font-bold mb-3 leading-tight">
                  {blog.title}
                </h1>
                <div className="flex flex-wrap items-center gap-3 text-sm">
                  <span>{new Date(blog.createdAt).toLocaleDateString('en-US', { 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  })}</span>
                  {blog.category && (
                    <>
                      <span className="text-gray-300">•</span>
                      <span className="px-2 py-0.5 bg-white/20 rounded-full text-xs">
                        {blog.category}
                      </span>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Main Content */}
        <div className="max-w-3xl mx-auto px-6 py-12">
          {/* Back Button */}
          <div className="mb-6">
            <a 
              href="/blogs"
              className="inline-flex items-center gap-2 px-3 py-1.5 text-button text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Blogs
            </a>
          </div>
          {/* Header for posts without cover image */}
          {!blog.coverImage && (
            <header className="mb-8 text-center">
              <h1 className="text-h3 md:text-h2 font-bold mb-4 text-gray-900 leading-tight">
                {blog.title}
              </h1>
              <div className="flex flex-wrap items-center justify-center gap-3 text-sm text-gray-600">
                <span>{new Date(blog.createdAt).toLocaleDateString('en-US', { 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}</span>
                {blog.category && (
                  <>
                    <span>•</span>
                    <span className="px-2 py-0.5 bg-gray-100 text-gray-700 rounded-full text-xs">
                      {blog.category}
                    </span>
                  </>
                )}
              </div>
            </header>
          )}

          {/* Reading Time and Stats */}
          <div className="flex flex-wrap items-center justify-center gap-3 mb-6 text-xs text-gray-600">
            <div className="flex items-center space-x-1.5">
              <FaClock className="h-3.5 w-3.5" />
              <span>{blog.readTime || Math.ceil(blog.content.split(/\s+/).length / 200)} min read</span>
            </div>
            <span>•</span>
            <div className="flex items-center space-x-1.5">
              <FaEye className="h-3.5 w-3.5" />
              <span>{blog.stats?.views?.total?.toLocaleString() || 0} views</span>
            </div>
            <span>•</span>
            <div className="flex items-center space-x-1.5">
              <FaComment className="h-3.5 w-3.5" />
              <span>{commentsCount.toLocaleString()} comments</span>
            </div>
            <span>•</span>
            <div className="flex items-center space-x-1.5">
              <FaHeart className="h-3.5 w-3.5" />
              <span>{likesTotal.toLocaleString()} likes</span>
            </div>
          </div>

          {/* Tags */}
          {blog.tags?.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-6 justify-center">
              {blog.tags.map((tag: string) => (
                <span
                  key={tag}
                  className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded-full text-xs"
                >
                  #{tag}
                </span>
              ))}
            </div>
          )}

          {/* Article Content */}
          <article className="prose prose-sm prose-compact max-w-none mb-10 font-prose">
            <RichTextViewer 
              html={blog.content} 
              lineSpacing={blog.lineSpacing || '10'}
              className="
                prose-headings:text-gray-900 prose-headings:font-bold
                prose-headings:scroll-mt-24
                prose-h1:text-xl prose-h2:text-lg prose-h3:text-base prose-h4:text-sm prose-h1:my-1 prose-h2:my-1 prose-h3:my-1 prose-h4:my-0 prose-headings:leading-tight
                prose-p:text-gray-700 prose-p:text-sm prose-p:my-0
                prose-a:text-blue-600 prose-a:no-underline hover:prose-a:underline
                prose-img:rounded-lg prose-img:shadow-sm prose-img:my-1
                prose-blockquote:border-l-4 prose-blockquote:border-gray-300 prose-blockquote:bg-gray-50 prose-blockquote:p-2 prose-blockquote:my-1 prose-blockquote:text-xs
                prose-ul:my-0 prose-ol:my-0
                prose-li:my-0 prose-li:text-sm list-inside
                prose-code:bg-gray-100 prose-code:px-1 prose-code:py-0.5 prose-code:rounded prose-code:text-[11px]
                prose-pre:bg-gray-900 prose-pre:text-gray-100 prose-pre:p-1.5 prose-pre:rounded-lg prose-pre:my-1 prose-pre:text-[11px]
                prose-strong:text-gray-900 prose-strong:font-semibold
                prose-em:text-gray-700
                prose-hr:border-gray-200 prose-hr:my-1
              "
            />
          </article>

          {/* Stats and Actions */}
          <div className="border-t border-gray-200 pt-6 mb-6">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div className="flex items-center space-x-4 text-gray-600 text-xs">
                <ViewCounter 
                  slug={params.id} 
                  initialViews={blog.stats?.views?.total || 0} 
                />
                <div className="flex items-center space-x-2">
                  <FaComment className="h-3 w-3" />
                  <span>{commentsCount} comments</span>
                </div>
              </div>
              <div className="flex items-center space-x-2 text-xs">
                <LikeButton 
                  slug={params.id} 
                  initialLikes={likesTotal} 
                />
                <ShareButtons shareData={shareData} slug={params.id} />
              </div>
            </div>
          </div>

          {/* Author Info */}
          {blog.author && (
            <div className="border-t border-gray-200 pt-6 mb-6">
              <h3 className="text-h5 weight-semibold text-gray-900 mb-3">About the Author</h3>
              <div className="flex items-start space-x-3">
                <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center text-gray-700 font-semibold">
                  {blog.author.avatar ? (
                    <img 
                      src={blog.author.avatar} 
                      alt={blog.author.name}
                      className="w-full h-full object-cover rounded-full"
                    />
                  ) : (
                  <span className="text-sm">{blog.author.name.charAt(0)}</span>
                  )}
                </div>
                <div className="flex-1">
                  <h4 className="text-sm font-semibold text-gray-900">{blog.author.name}</h4>
                  {blog.author.bio && (
                  <p className="text-gray-600 mt-1 text-xs leading-5">{blog.author.bio}</p>
                  )}
                  {blog.author.social && (
                  <div className="flex items-center gap-2 mt-2 text-xs">
                      {blog.author.social.twitter && (
                        <a 
                          href={blog.author.social.twitter}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-gray-600 hover:text-blue-500 transition-colors"
                        >
                      <FaTwitter className="w-3 h-3" />
                        </a>
                      )}
                      {blog.author.social.linkedin && (
                        <a 
                          href={blog.author.social.linkedin}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-gray-600 hover:text-blue-700 transition-colors"
                        >
                      <FaLinkedin className="w-3 h-3" />
                        </a>
                      )}
                      {blog.author.social.github && (
                        <a 
                          href={blog.author.social.github}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-gray-600 hover:text-gray-900 transition-colors"
                        >
                      <FaGithub className="w-3 h-3" />
                        </a>
                      )}
                      {blog.author.social.website && (
                        <a 
                          href={blog.author.social.website}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-gray-600 hover:text-purple-600 transition-colors"
                        >
                      <FaGlobe className="w-3 h-3" />
                        </a>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Comments Section */}
          <CommentSection 
            slug={params.id} 
          />
        </div>

        <Footer />
      </div>
    </>
  );
}