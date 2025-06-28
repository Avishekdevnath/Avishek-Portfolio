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

  return {
    title: blog.title,
    description: blog.excerpt,
    openGraph: {
      title: blog.title,
      description: blog.excerpt,
      type: 'article',
      url: `/blogs/${blog.slug}`,
      images: blog.coverImage ? [blog.coverImage] : undefined,
      siteName: 'Avishek Portfolio',
      article: {
        publishedTime: blog.createdAt,
        modifiedTime: blog.updatedAt,
        authors: [blog.author.name],
        tags: blog.tags,
      },
    },
    twitter: {
      card: 'summary_large_image',
      title: blog.title,
      description: blog.excerpt,
      images: blog.coverImage ? [blog.coverImage] : undefined,
    },
  };
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

  return (
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
            <div 
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
                prose-abbr:border-b prose-abbr:border-dotted prose-abbr:border-gray-400 prose-abbr:cursor-help
                "
              dangerouslySetInnerHTML={{ __html: blog.content }}
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
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M18 10c0 3.866-3.582 7-8 7a8.841 8.841 0 01-4.083-.98L2 17l1.338-3.123C2.493 12.767 2 11.434 2 10c0-3.866 3.582-7 8-7s8 3.134 8 7zM7 9H5v2h2V9zm8 0h-2v2h2V9zM9 9h2v2H9V9z" clipRule="evenodd" />
                </svg>
                <span className="font-medium">{blog.stats?.comments?.total || 0} comments</span>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <LikeButton 
                slug={params.id} 
                initialLikes={blog.stats?.likes?.total || 0} 
              />
              <ShareButtons shareData={shareData} />
            </div>
          </div>
        </div>

        {/* Author Info */}
        {blog.author && (
          <div className="bg-white/90 backdrop-blur-md rounded-2xl shadow-lg border border-white/60 p-6 mb-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">About the Author</h3>
            <div className="flex items-start space-x-4">
              <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-xl">
                {blog.author.name.charAt(0)}
              </div>
              <div className="flex-1">
                <h4 className="text-lg font-semibold text-gray-900">{blog.author.name}</h4>
                <p className="text-blue-600 text-sm mb-2">{blog.author.email}</p>
                {blog.author.bio && (
                  <p className="text-gray-700 leading-relaxed">{blog.author.bio}</p>
                )}
                {blog.author.social && (
                  <div className="flex items-center space-x-3 mt-3">
                    {blog.author.social.twitter && (
                      <a
                        href={blog.author.social.twitter}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-400 hover:text-blue-600 transition-colors"
                      >
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
                        </svg>
                      </a>
                    )}
                    {blog.author.social.linkedin && (
                      <a
                        href={blog.author.social.linkedin}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-800 transition-colors"
                      >
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                        </svg>
                      </a>
                    )}
                    {blog.author.social.github && (
                      <a
                        href={blog.author.social.github}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-gray-800 hover:text-gray-600 transition-colors"
                      >
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.237 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                        </svg>
                      </a>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Comments Section */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/50 p-6 md:p-8">
          <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-3 text-blue-600" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M18 10c0 3.866-3.582 7-8 7a8.841 8.841 0 01-4.083-.98L2 17l1.338-3.123C2.493 12.767 2 11.434 2 10c0-3.866 3.582-7 8-7s8 3.134 8 7zM7 9H5v2h2V9zm8 0h-2v2h2V9zM9 9h2v2H9V9z" clipRule="evenodd" />
            </svg>
            Comments
          </h3>
          <CommentSection slug={params.id} />
        </div>
      </div>
      <Footer />
    </div>
  );
}