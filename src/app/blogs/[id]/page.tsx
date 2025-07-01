import { Metadata } from 'next';
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
import { FaClock, FaEye, FaComment, FaHeart, FaShare, FaTwitter, FaLinkedin, FaGithub, FaGlobe } from 'react-icons/fa';
import RichTextViewer from '@/components/shared/RichTextViewer';
import Comment from '@/models/Comment';

interface BlogPostPageProps {
  params: {
    id: string;
  };
}

// Generate metadata for the page
export async function generateMetadata({ params }: BlogPostPageProps): Promise<Metadata> {
  await connectToDatabase();
  const blog = await Blog.findOne({ slug: params.id });

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
  const blog: any = await Blog.findOne({ slug: params.id });

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

      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50">
        <Header />
        
        {/* Hero Section with Cover Image */}
        {blog.coverImage && (
          <div className="relative h-[60vh] min-h-[400px] max-h-[600px] overflow-hidden">
            <div className="absolute inset-0 z-10 bg-[radial-gradient(circle_at_center,rgba(0,0,0,0.7)_0%,rgba(0,0,0,0.3)_50%,transparent_90%)]"></div>
            <img
              src={blog.coverImage}
              alt={blog.title}
              className="w-full h-full object-cover transform scale-105 transition-transform duration-500"
            />
            <div className="absolute bottom-0 left-0 right-0 z-20 p-8 text-white">
              <div className="max-w-4xl mx-auto">
                <h1 className="text-5xl md:text-6xl font-bold mb-4 leading-tight">
                  {blog.title}
                </h1>
                <div className="flex flex-wrap items-center gap-4 text-lg">
                  <div className="flex items-center space-x-2">
                    <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold">
                      {blog.author.name.charAt(0)}
                    </div>
                    <span className="font-medium">{blog.author.name}</span>
                  </div>
                  <span className="text-gray-300">•</span>
                  <span>{new Date(blog.createdAt).toLocaleDateString('en-US', { 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  })}</span>
                  {blog.category && (
                    <>
                      <span className="text-gray-300">•</span>
                      <span className="px-3 py-1 bg-white/20 backdrop-blur-sm rounded-full text-sm font-medium">
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
        <div className="max-w-4xl mx-auto px-6 py-12">
          {/* Header for posts without cover image */}
          {!blog.coverImage && (
            <header className="mb-12 text-center">
              <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-gray-900 via-blue-800 to-purple-800 bg-clip-text text-transparent leading-tight">
                {blog.title}
              </h1>
              <div className="flex flex-wrap items-center justify-center gap-4 text-lg text-gray-600">
                <div className="flex items-center space-x-2">
                  <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold text-lg">
                    {blog.author.name.charAt(0)}
                  </div>
                  <span className="font-medium">{blog.author.name}</span>
                </div>
                <span>•</span>
                <span>{new Date(blog.createdAt).toLocaleDateString('en-US', { 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}</span>
                {blog.category && (
                  <>
                    <span>•</span>
                    <span className="px-4 py-2 bg-gradient-to-r from-blue-100 to-purple-100 text-blue-800 rounded-full text-sm font-medium">
                      {blog.category}
                    </span>
                  </>
                )}
              </div>
            </header>
          )}

          {/* Reading Time and Stats */}
          <div className="flex flex-wrap items-center justify-center gap-4 md:gap-6 mb-8">
            {[
              {
                icon: FaClock,
                value: `${blog.readTime || Math.ceil(blog.content.split(/\\s+/).length / 200)} min read`,
                label: '',
                bg: 'from-purple-500 to-indigo-500'
              },
              {
                icon: FaEye,
                value: `${blog.stats.views.total.toLocaleString()} views`,
                label: blog.stats.views.unique ? `${blog.stats.views.unique.toLocaleString()} unique` : '',
                bg: 'from-blue-500 to-cyan-500'
              },
              {
                icon: FaComment,
                value: `${commentsCount.toLocaleString()} comments`,
                label: '',
                bg: 'from-emerald-500 to-teal-500'
              },
              {
                icon: FaHeart,
                value: `${likesTotal.toLocaleString()} likes`,
                label: '',
                bg: 'from-rose-500 to-pink-500'
              },
              {
                icon: FaShare,
                value: `${blog.stats.shares.total.toLocaleString()} shares`,
                label: '',
                bg: 'from-yellow-500 to-amber-500'
              },
            ].map(({ icon: Icon, value, label, bg }, idx) => (
              <div
                key={idx}
                className={`flex items-center space-x-2 px-4 py-2 rounded-full text-white bg-gradient-to-r ${bg} shadow`}
              >
                <Icon className="h-4 w-4" />
                <span className="font-semibold whitespace-nowrap">{value}{label && ` • ${label}`}</span>
              </div>
            ))}
          </div>

          {/* Tags */}
          {blog.tags?.length > 0 && (
            <div className="flex flex-wrap gap-3 mb-12 justify-center">
              {blog.tags.map((tag: string) => (
                <span
                  key={tag}
                  className="px-4 py-2 bg-white/70 backdrop-blur-md border border-gray-200 hover:border-blue-400 text-gray-600 hover:text-blue-700 rounded-full text-sm font-medium transition-all duration-200 shadow hover:shadow-lg hover:-translate-y-0.5 cursor-pointer"
                >
                  #{tag}
                </span>
              ))}
            </div>
          )}

          {/* Article Content */}
          <article className="bg-white/90 backdrop-blur-md rounded-3xl shadow-lg border border-white/50 p-8 md:p-12 mb-12 transition-shadow duration-300 hover:shadow-xl">
            <div className="relative z-10">
              <RichTextViewer 
                html={blog.content} 
                className="prose prose-lg max-w-none 
                  prose-headings:text-gray-900 prose-headings:font-bold
                  prose-headings:scroll-mt-24
                  prose-h1:text-3xl prose-h2:text-2xl prose-h3:text-xl
                  prose-p:text-gray-700 prose-p:leading-relaxed prose-p:my-4
                  prose-p:text-gray-700 prose-p:leading-relaxed
                  prose-a:text-blue-600 prose-a:no-underline hover:prose-a:underline
                  prose-img:rounded-lg prose-img:shadow-md prose-img:my-6 prose-img:mx-auto
                  prose-blockquote:border-l-4 prose-blockquote:border-blue-500 prose-blockquote:bg-blue-50 prose-blockquote:p-4
                  prose-ul:my-4 prose-ol:my-4
                  prose-code:bg-gray-100 prose-code:px-1 prose-code:rounded-md
                  prose-pre:bg-gray-800 prose-pre:text-gray-100 prose-pre:p-4 prose-pre:rounded-lg"
              />
            </div>
          </article>

          {/* Stats and Actions */}
          <div className="bg-white/90 backdrop-blur-md rounded-2xl shadow-lg border border-white/60 p-6 mb-8 hover:shadow-xl transition-all duration-300">
            <div className="flex items-center justify-between flex-wrap gap-6">
              <div className="flex items-center space-x-8 text-gray-600">
                <ViewCounter 
                  slug={params.id} 
                  initialViews={blog.stats?.views?.total || 0} 
                />
                <div className="flex items-center space-x-2 hover:text-purple-600 transition-colors duration-200">
                  <FaComment className="h-5 w-5" />
                  <span className="font-medium">{blog.stats?.comments?.total || 0} comments</span>
                </div>
              </div>
              <div className="flex items-center space-x-4">
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
            <div className="bg-white/90 backdrop-blur-md rounded-2xl shadow-lg border border-white/60 p-6 mb-8">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">About the Author</h3>
              <div className="flex items-start space-x-4">
                <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-xl">
                  {blog.author.avatar ? (
                    <img 
                      src={blog.author.avatar} 
                      alt={blog.author.name}
                      className="w-full h-full object-cover rounded-full"
                    />
                  ) : (
                    blog.author.name.charAt(0)
                  )}
                </div>
                <div className="flex-1">
                  <h4 className="text-xl font-semibold text-gray-900">{blog.author.name}</h4>
                  {blog.author.bio && (
                    <p className="text-gray-600 mt-2">{blog.author.bio}</p>
                  )}
                  {blog.author.social && (
                    <div className="flex items-center gap-4 mt-4">
                      {blog.author.social.twitter && (
                        <a 
                          href={blog.author.social.twitter}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-gray-600 hover:text-blue-500 transition-colors"
                        >
                          <FaTwitter className="w-5 h-5" />
                        </a>
                      )}
                      {blog.author.social.linkedin && (
                        <a 
                          href={blog.author.social.linkedin}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-gray-600 hover:text-blue-700 transition-colors"
                        >
                          <FaLinkedin className="w-5 h-5" />
                        </a>
                      )}
                      {blog.author.social.github && (
                        <a 
                          href={blog.author.social.github}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-gray-600 hover:text-gray-900 transition-colors"
                        >
                          <FaGithub className="w-5 h-5" />
                        </a>
                      )}
                      {blog.author.social.website && (
                        <a 
                          href={blog.author.social.website}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-gray-600 hover:text-purple-600 transition-colors"
                        >
                          <FaGlobe className="w-5 h-5" />
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