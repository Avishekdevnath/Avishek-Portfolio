import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { connectToDatabase } from '@/lib/mongodb';
import Blog from '@/models/Blog';
import CommentSection from '@/components/CommentSection';
import LikeButton from '@/components/LikeButton';
import ViewCounter from '@/components/ViewCounter';
import Header from '@/components/shared/Header';
import Footer from '@/components/shared/Footer';
import ShareButtons from '@/components/ShareButtons';
import DraftViewer from '@/components/shared/DraftViewer';
import { FaClock, FaEye, FaComment, FaHeart, FaShare, FaTwitter, FaLinkedin, FaGithub, FaGlobe } from 'react-icons/fa';

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
  const blog = await Blog.findOne({ slug: params.id });

  if (!blog) {
    notFound();
  }

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
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent z-10"></div>
            <img
              src={blog.coverImage}
              alt={blog.title}
              className="w-full h-full object-cover"
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
          <div className="flex flex-wrap items-center justify-center gap-6 mb-8 text-gray-600">
            <div className="flex items-center gap-2">
              <FaClock className="w-4 h-4" />
              <span>{blog.readTime || Math.ceil(blog.content.split(/\s+/).length / 200)} min read</span>
            </div>
            <div className="flex items-center gap-2">
              <FaEye className="w-4 h-4" />
              <span>{blog.stats.views.total} views ({blog.stats.views.unique} unique)</span>
            </div>
            <div className="flex items-center gap-2">
              <FaComment className="w-4 h-4" />
              <span>{blog.stats.comments.total} comments</span>
            </div>
            <div className="flex items-center gap-2">
              <FaHeart className="w-4 h-4" />
              <span>{blog.stats.likes.total} likes</span>
            </div>
            <div className="flex items-center gap-2">
              <FaShare className="w-4 h-4" />
              <span>{blog.stats.shares.total} shares</span>
            </div>
          </div>

          {/* Tags */}
          {blog.tags?.length > 0 && (
            <div className="flex flex-wrap gap-3 mb-8 justify-center">
              {blog.tags.map((tag) => (
                <span
                  key={tag}
                  className="px-4 py-2 bg-white/80 backdrop-blur-sm border border-gray-200 hover:border-blue-300 text-gray-700 hover:text-blue-700 rounded-full text-sm font-medium transition-all duration-200 hover:shadow-md hover:-translate-y-0.5 cursor-pointer"
                >
                  #{tag}
                </span>
              ))}
            </div>
          )}

          {/* Article Content */}
          <article className="bg-white/95 backdrop-blur-md rounded-3xl shadow-2xl border border-white/60 p-8 md:p-12 mb-10 hover:shadow-3xl transition-all duration-500 relative overflow-hidden">
            {/* Subtle gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-br from-blue-50/30 to-purple-50/30 rounded-3xl pointer-events-none"></div>
            <div className="relative z-10">
              <DraftViewer 
                content={blog.content}
                className="prose prose-xl max-w-none 
                  prose-headings:text-gray-900 prose-headings:font-bold prose-headings:tracking-tight prose-headings:scroll-mt-16
                  prose-h1:text-4xl prose-h1:mb-6 prose-h1:mt-8 prose-h1:leading-tight prose-h1:border-b prose-h1:border-gray-200 prose-h1:pb-4
                  prose-h2:text-3xl prose-h2:mb-4 prose-h2:mt-8 prose-h2:leading-tight prose-h2:text-blue-800
                  prose-h3:text-2xl prose-h3:mb-3 prose-h3:mt-6 prose-h3:leading-tight prose-h3:text-blue-700
                  prose-h4:text-xl prose-h4:mb-2 prose-h4:mt-4 prose-h4:leading-tight prose-h4:text-blue-600
                  prose-h5:text-lg prose-h5:mb-2 prose-h5:mt-4 prose-h5:font-semibold prose-h5:text-blue-600
                  prose-h6:text-base prose-h6:mb-2 prose-h6:mt-4 prose-h6:font-semibold prose-h6:text-gray-700
                  prose-p:text-gray-700 prose-p:leading-relaxed prose-p:mb-4
                  prose-a:text-blue-600 prose-a:no-underline hover:prose-a:underline prose-a:font-medium prose-a:transition-colors
                  prose-strong:text-gray-900 prose-strong:font-bold
                  prose-em:text-gray-800 prose-em:italic
                  prose-mark:bg-yellow-200 prose-mark:px-1 prose-mark:rounded
                  prose-del:line-through prose-del:text-gray-500
                  prose-ins:underline prose-ins:text-green-700 prose-ins:decoration-green-500
                  prose-img:rounded-2xl prose-img:shadow-xl prose-img:border prose-img:border-gray-200 prose-img:my-8
                  prose-figure:my-8
                  prose-figcaption:text-gray-600 prose-figcaption:text-center prose-figcaption:mt-2 prose-figcaption:italic
                  prose-blockquote:border-l-4 prose-blockquote:border-blue-500 prose-blockquote:bg-gradient-to-r prose-blockquote:from-blue-50 prose-blockquote:to-purple-50 prose-blockquote:p-6 prose-blockquote:rounded-r-xl prose-blockquote:shadow-sm prose-blockquote:my-6 prose-blockquote:italic prose-blockquote:text-gray-700
                  prose-ul:my-4 prose-ul:space-y-2
                  prose-ol:my-4 prose-ol:space-y-2
                  prose-li:text-gray-700 prose-li:leading-relaxed
                  prose-li:marker:text-blue-500
                  prose-table:my-8 prose-table:border-collapse prose-table:border prose-table:border-gray-300 prose-table:rounded-lg prose-table:overflow-hidden prose-table:shadow-sm
                  prose-thead:bg-gray-50
                  prose-th:border prose-th:border-gray-300 prose-th:p-3 prose-th:text-left prose-th:font-semibold prose-th:text-gray-900
                  prose-td:border prose-td:border-gray-300 prose-td:p-3 prose-td:text-gray-700
                  prose-tr:hover:bg-gray-50 prose-tr:transition-colors
                  prose-hr:my-8 prose-hr:border-t-2 prose-hr:border-gray-200 prose-hr:rounded
                  prose-pre:bg-gray-900 prose-pre:text-gray-100 prose-pre:rounded-xl prose-pre:shadow-lg prose-pre:p-6 prose-pre:overflow-x-auto prose-pre:my-6
                  prose-code:bg-gray-100 prose-code:px-2 prose-code:py-1 prose-code:rounded-md prose-code:text-sm prose-code:font-mono prose-code:text-gray-800 prose-code:before:content-none prose-code:after:content-none
                  prose-pre:prose-code:bg-transparent prose-pre:prose-code:p-0 prose-pre:prose-code:text-gray-100
                  prose-kbd:bg-gray-800 prose-kbd:text-white prose-kbd:px-2 prose-kbd:py-1 prose-kbd:rounded prose-kbd:text-xs prose-kbd:font-mono prose-kbd:shadow
                  prose-sup:text-xs prose-sup:text-blue-600
                  prose-sub:text-xs prose-sub:text-blue-600
                  prose-small:text-sm prose-small:text-gray-600
                  prose-video:rounded-xl prose-video:shadow-lg prose-video:my-8
                  prose-iframe:rounded-xl prose-iframe:shadow-lg prose-iframe:my-8 prose-iframe:w-full
                  prose-details:my-4 prose-details:border prose-details:border-gray-200 prose-details:rounded-lg prose-details:p-4
                  prose-summary:font-semibold prose-summary:cursor-pointer prose-summary:text-blue-700 prose-summary:hover:text-blue-800
                  prose-abbr:border-b prose-abbr:border-dotted prose-abbr:border-gray-400 prose-abbr:cursor-help"
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
                  uniqueViews={blog.stats?.views?.unique || 0}
                />
                <div className="flex items-center space-x-2 hover:text-purple-600 transition-colors duration-200">
                  <FaComment className="h-5 w-5" />
                  <span className="font-medium">{blog.stats?.comments?.total || 0} comments</span>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <LikeButton 
                  slug={params.id} 
                  initialLikes={blog.stats?.likes?.total || 0} 
                />
                <ShareButtons shareData={shareData} shareCounts={blog.stats?.shares} />
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
            blogId={blog._id.toString()} 
            initialComments={blog.stats?.comments || { total: 0, approved: 0, pending: 0, spam: 0 }}
          />
        </div>

        <Footer />
      </div>
    </>
  );
}