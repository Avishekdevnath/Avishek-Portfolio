import { Metadata } from 'next';
export const revalidate = 0;
import { notFound, permanentRedirect } from 'next/navigation';
import Link from 'next/link';
import { connectDB } from '@/lib/mongodb';
import Blog from '@/models/Blog';
import BlogStats from '@/models/BlogStats';
import Comment from '@/models/Comment';
import CommentSection from '@/components/CommentSection';
import LikeButton from '@/components/LikeButton';
import ViewCounter from '@/components/ViewCounter';
import ShareButtons from '@/components/ShareButtons';
import RichTextViewer from '@/components/shared/RichTextViewer';
import ReadingProgress from '@/components/blog/ReadingProgress';
import BlogStickyNav from '@/components/blog/BlogStickyNav';
import BlogTOC from '@/components/blog/BlogTOC';
import Header from '@/components/shared/Header';
import Footer from '@/components/shared/Footer';
import PageReadyOnMount from '@/components/shared/PageReadyOnMount';
import { getSiteUrl } from '@/lib/url';

interface BlogPostPageProps {
  params: {
    slug: string;
  };
}

/* ── Accent color helpers ── */
const ACCENT_GRADIENTS = [
  "bg-gradient-to-r from-accent-orange to-[#f5a87a]",
  "bg-gradient-to-r from-accent-teal to-[#6ab8ae]",
  "bg-gradient-to-r from-accent-blue to-[#6a9fd8]",
  "bg-gradient-to-r from-deep-brown to-warm-brown",
];
const ACCENT_INLINE = [
  "background:linear-gradient(90deg,#d4622a,#f5a87a)",
  "background:linear-gradient(90deg,#3a7d6e,#6ab8ae)",
  "background:linear-gradient(90deg,#2d5a8e,#6a9fd8)",
  "background:linear-gradient(90deg,#4a3728,#8b7355)",
];
const accentCache = new Map<string, number>();
let accentIdx = 0;
function getAccentIdx(category: string) {
  if (!accentCache.has(category)) {
    accentCache.set(category, accentIdx % ACCENT_GRADIENTS.length);
    accentIdx++;
  }
  return accentCache.get(category)!;
}

/* ── Date formatter ── */
function formatDate(date: string | Date) {
  return new Date(date).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function formatNumber(num: number) {
  return num >= 1000 ? (num / 1000).toFixed(1) + "k" : num.toString();
}

/* ── Extract TOC items from HTML content ── */
function extractTOC(html: string) {
  const items: { id: string; text: string; level: number }[] = [];
  const regex = /<h([23])[^>]*id=["']([^"']+)["'][^>]*>(.*?)<\/h[23]>/gi;
  let match;
  while ((match = regex.exec(html)) !== null) {
    const text = match[3].replace(/<[^>]+>/g, "").trim();
    if (text) {
      items.push({ id: match[2], text, level: parseInt(match[1]) });
    }
  }
  return items;
}

// Generate metadata for the page
export async function generateMetadata({ params }: BlogPostPageProps): Promise<Metadata> {
  await connectDB();
  const blog = await Blog.findOne({ slug: params.slug })
    ?? await Blog.findOne({ slugHistory: params.slug });

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
      url: `/blogs/${blog.slug}`,  // canonical slug, not params.slug
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
  await connectDB();
  let blog: any = await Blog.findOne({ slug: params.slug });

  if (!blog) {
    // Check slug history for a redirect
    const redirectTarget = await Blog.findOne({ slugHistory: params.slug });
    if (redirectTarget) {
      permanentRedirect(`/blogs/${redirectTarget.slug}`);
    }
    notFound();
  }

  // Fetch related blogs
  const relatedBlogs = await Blog.find({
    _id: { $ne: blog._id },
    $or: [
      { category: blog.category },
      { tags: { $in: blog.tags } },
    ],
    status: 'published',
  })
    .limit(3)
    .sort({ createdAt: -1 });

  // Fetch prev/next blogs
  const [prevBlog, nextBlog] = await Promise.all([
    Blog.findOne({
      status: 'published',
      publishedAt: { $lt: blog.publishedAt || blog.createdAt },
    })
      .sort({ publishedAt: -1 })
      .select('title slug'),
    Blog.findOne({
      status: 'published',
      publishedAt: { $gt: blog.publishedAt || blog.createdAt },
    })
      .sort({ publishedAt: 1 })
      .select('title slug'),
  ]);

  // Fetch stats
  const blogStatsDoc = await BlogStats.findOne({ blog: blog._id });
  const likesTotal = blogStatsDoc ? blogStatsDoc.likes.length : blog.stats?.likes?.total || 0;
  const viewsTotal = blogStatsDoc ? blogStatsDoc.views.length : blog.stats?.views?.total || 0;
  const commentsCount = await Comment.countDocuments({ blogId: blog._id });

  const readTime = blog.readTime || Math.ceil(blog.content.split(/\s+/).length / 200);
  const tocItems = extractTOC(blog.content || "");

  const shareData = {
    title: blog.title,
    description: blog.excerpt,
    url: `${getSiteUrl()}/blogs/${blog.slug}`,
    image: blog.coverImage,
    tags: blog.tags,
    author: blog.author.name,
  };

  const structuredData = blog.structuredData || {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: blog.metaTitle || blog.title,
    description: blog.metaDescription || blog.excerpt,
    author: {
      "@type": "Person",
      name: blog.author.name,
      url: blog.author.social?.website,
    },
    datePublished: blog.publishedAt || blog.createdAt.toISOString(),
    dateModified: blog.updatedAt.toISOString(),
    image: blog.coverImage,
    publisher: {
      "@type": "Organization",
      name: "Avishek Portfolio",
      logo: { "@type": "ImageObject", url: "/logo.png" },
    },
  };

  return (
    <>
      <PageReadyOnMount />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />

      <div className="min-h-screen bg-cream font-body">
        {/* Reading Progress */}
        <ReadingProgress />

        {/* Main Navigation */}
        <div className="pt-6">
          <Header />
        </div>

        {/* Page Content */}
        <div className="max-w-[1200px] mx-auto px-6">

          {/* Back to Blogs */}
          <nav className="flex items-center gap-2 font-mono text-[0.65rem] tracking-[0.08em] text-text-muted pt-14 pb-2">
            <Link href="/blogs" className="text-text-muted no-underline hover:text-accent-orange transition-colors flex items-center gap-2 group">
              <svg className="w-3.5 h-3.5 transition-transform duration-200 group-hover:-translate-x-[3px]" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Back to Blogs
            </Link>
          </nav>

          {/* ── HERO ── */}
          <div className="pt-6 pb-10 animate-fadeIn">
            {/* Eyebrow */}
            <div className="flex items-center gap-2.5 flex-wrap mb-5">
              {blog.category && (
                <span className="font-mono text-[.6rem] tracking-[.1em] uppercase px-3 py-1 rounded-full border border-cream-deeper bg-cream-dark text-warm-brown">
                  {blog.category}
                </span>
              )}
              {blog.featured && (
                <span className="font-mono text-[.58rem] tracking-[.15em] uppercase text-accent-orange flex items-center gap-1.5 before:content-['★'] before:text-[.55rem]">
                  Featured
                </span>
              )}
              <span className="font-mono text-[.6rem] text-text-muted flex items-center gap-1.5 ml-auto">
                <svg className="w-3 h-3 opacity-60" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                  <circle cx="12" cy="12" r="10" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6l4 2" />
                </svg>
                {readTime} min read
              </span>
            </div>

            {/* Title */}
            <h1 className="font-heading text-[clamp(2rem,5.5vw,3.4rem)] font-light leading-[1.08] text-ink mb-4">
              {blog.title}
            </h1>

            {/* Subtitle / Excerpt */}
            {blog.excerpt && (
              <p className="text-[1rem] leading-[1.75] text-text-muted font-light max-w-[56ch] mb-7">
                {blog.excerpt}
              </p>
            )}

            {/* Author Row */}
            <div className="flex items-center justify-between flex-wrap gap-4 py-5 border-t border-b border-cream-deeper">
              <div className="flex items-center gap-3.5">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-warm-brown to-accent-orange flex items-center justify-center font-heading text-[1.1rem] font-semibold text-off-white flex-shrink-0 overflow-hidden">
                  {blog.author.avatar ? (
                    <img
                      src={blog.author.avatar}
                      alt={blog.author.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    blog.author.name.charAt(0)
                  )}
                </div>
                <div>
                  <div className="text-[.88rem] font-medium text-ink">{blog.author.name}</div>
                  {blog.author.social?.twitter && (
                    <div className="font-mono text-[.62rem] text-text-muted mt-0.5">
                      @{blog.author.social.twitter.split('/').pop()}
                    </div>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-5 flex-wrap">
                <span className="font-mono text-[.63rem] text-text-muted flex items-center gap-1.5">
                  <svg className="w-[11px] h-[11px] opacity-55" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                    <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                    <line x1="16" y1="2" x2="16" y2="6" />
                    <line x1="8" y1="2" x2="8" y2="6" />
                    <line x1="3" y1="10" x2="21" y2="10" />
                  </svg>
                  {formatDate(blog.publishedAt || blog.createdAt)}
                </span>
                <span className="font-mono text-[.63rem] text-text-muted flex items-center gap-1.5">
                  <svg className="w-[11px] h-[11px] opacity-55" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                  {formatNumber(viewsTotal)} views
                </span>
                <span className="font-mono text-[.63rem] text-text-muted flex items-center gap-1.5">
                  <svg className="w-[11px] h-[11px] opacity-55" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                  </svg>
                  {formatNumber(likesTotal)} likes
                </span>
              </div>
            </div>

            {/* Tags */}
            {blog.tags?.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mt-5">
                {blog.tags.map((tag: string) => (
                  <span
                    key={tag}
                    className="font-mono text-[.62rem] text-accent-orange tracking-[.04em] px-2.5 py-1 rounded-full bg-[rgba(212,98,42,.08)] border border-[rgba(212,98,42,.18)]"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* ── MAIN LAYOUT: ARTICLE + SIDEBAR ── */}
          <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,680px)_260px] gap-16 items-start mt-4">

            {/* ── ARTICLE ── */}
            <article>
              {/* Cover Image */}
              {blog.coverImage && (
                <div className="rounded-[.85rem] overflow-hidden aspect-[16/7] relative mb-8 -mx-4 lg:mx-0">
                  <img
                    src={blog.coverImage}
                    alt={blog.title}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}

              {/* Article Body */}
              <div className="article-body-cream">
                <RichTextViewer
                  html={blog.content}
                  lineSpacing={blog.lineSpacing || '10'}
                  className="
                    prose-headings:font-heading prose-headings:text-ink prose-headings:font-light
                    prose-headings:scroll-mt-24
                    prose-h2:text-[1.75rem] prose-h2:leading-[1.2] prose-h2:mt-11 prose-h2:mb-4
                    prose-h3:font-body prose-h3:text-[.78rem] prose-h3:font-semibold prose-h3:tracking-[.03em] prose-h3:uppercase prose-h3:text-deep-brown prose-h3:mt-8 prose-h3:mb-3
                    prose-p:font-body prose-p:text-[.975rem] prose-p:leading-[1.85] prose-p:text-ink prose-p:font-light prose-p:mb-6
                    prose-a:text-accent-orange prose-a:no-underline hover:prose-a:underline
                    prose-img:rounded-[.85rem] prose-img:shadow-sm
                    prose-blockquote:border-l-[3px] prose-blockquote:border-accent-orange prose-blockquote:bg-[rgba(212,98,42,.04)] prose-blockquote:rounded-r-[.5rem] prose-blockquote:px-6 prose-blockquote:py-5 prose-blockquote:my-10
                    prose-ul:pl-5 prose-ol:pl-5
                    prose-li:text-[.975rem] prose-li:leading-[1.75] prose-li:text-ink prose-li:font-light prose-li:mb-1.5
                    prose-code:font-mono prose-code:text-[.8rem] prose-code:bg-cream-deeper prose-code:text-deep-brown prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded
                    prose-pre:bg-deep-brown prose-pre:text-[#e8d5c0] prose-pre:rounded-[.65rem] prose-pre:p-5 prose-pre:my-7
                    prose-strong:text-ink prose-strong:font-semibold
                    prose-em:text-warm-brown
                    prose-hr:border-cream-deeper prose-hr:my-10
                  "
                />
              </div>

              {/* ── ARTICLE FOOTER ── */}
              <div className="mt-16 pt-10 border-t border-cream-deeper">

                {/* Stats & Actions */}
                <div className="flex items-center justify-between flex-wrap gap-4 mb-10">
                  <div className="flex items-center gap-4">
                    <ViewCounter slug={params.slug} initialViews={viewsTotal} />
                  </div>
                  <div className="flex items-center gap-3">
                    <LikeButton slug={params.slug} initialLikes={likesTotal} />
                    <ShareButtons shareData={shareData} slug={params.slug} />
                  </div>
                </div>

                {/* Footer Tags */}
                {blog.tags?.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mb-10">
                    {blog.tags.map((tag: string) => (
                      <span
                        key={tag}
                        className="font-mono text-[.62rem] text-accent-orange tracking-[.04em] px-2.5 py-1 rounded-full bg-[rgba(212,98,42,.08)] border border-[rgba(212,98,42,.18)]"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                )}

                {/* Author Card */}
                {blog.author && (
                  <div className="bg-off-white border border-cream-deeper rounded-[.85rem] p-6 mb-10 flex items-start gap-4">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-warm-brown to-accent-orange flex items-center justify-center font-heading text-[1.2rem] font-semibold text-off-white flex-shrink-0 overflow-hidden">
                      {blog.author.avatar ? (
                        <img src={blog.author.avatar} alt={blog.author.name} className="w-full h-full object-cover" />
                      ) : (
                        blog.author.name.charAt(0)
                      )}
                    </div>
                    <div className="flex-1">
                      <h4 className="text-[.88rem] font-medium text-ink">{blog.author.name}</h4>
                      {blog.author.bio && (
                        <p className="text-[.82rem] text-text-muted font-light leading-[1.7] mt-1">{blog.author.bio}</p>
                      )}
                      {blog.author.social && (
                        <div className="flex items-center gap-3 mt-2">
                          {blog.author.social.twitter && (
                            <a href={blog.author.social.twitter} target="_blank" rel="noopener noreferrer" className="text-text-muted hover:text-accent-orange transition-colors">
                              <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" /></svg>
                            </a>
                          )}
                          {blog.author.social.linkedin && (
                            <a href={blog.author.social.linkedin} target="_blank" rel="noopener noreferrer" className="text-text-muted hover:text-accent-orange transition-colors">
                              <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" /></svg>
                            </a>
                          )}
                          {blog.author.social.github && (
                            <a href={blog.author.social.github} target="_blank" rel="noopener noreferrer" className="text-text-muted hover:text-accent-orange transition-colors">
                              <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0C5.374 0 0 5.373 0 12c0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0112 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z" /></svg>
                            </a>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Comments */}
                <CommentSection slug={params.slug} />

                {/* ── Related Articles ── */}
                {relatedBlogs.length > 0 && (
                  <div className="mt-12">
                    <h2 className="font-heading text-[1.5rem] font-light text-ink mb-5">
                      More to <em className="italic text-warm-brown">Read</em>
                    </h2>
                    <div className="grid grid-cols-[repeat(auto-fill,minmax(260px,1fr))] gap-4">
                      {relatedBlogs.map((rel: any) => {
                        const idx = getAccentIdx(rel.category || "General");
                        return (
                          <Link
                            key={rel._id.toString()}
                            href={`/blogs/${rel.slug}`}
                            className="group bg-off-white border border-cream-deeper rounded-[.85rem] overflow-hidden flex flex-col transition-all duration-250 hover:border-sand hover:shadow-[0_6px_22px_rgba(74,55,40,.09)] hover:-translate-y-[2px]"
                          >
                            <div className="h-[3px]" style={{ [ACCENT_INLINE[idx].split(':')[0]]: ACCENT_INLINE[idx].split(':').slice(1).join(':') } as any} />
                            <div className="p-4 flex-1">
                              <div className="font-mono text-[.58rem] tracking-[.1em] uppercase text-warm-brown mb-2">
                                {rel.category}
                              </div>
                              <div className="font-heading text-[1.05rem] font-semibold leading-[1.25] text-ink transition-colors duration-200 group-hover:text-accent-orange">
                                {rel.title}
                              </div>
                            </div>
                            <div className="px-4 py-3 border-t border-cream-deeper flex items-center justify-between bg-[rgba(240,236,227,.35)]">
                              <span className="font-mono text-[.6rem] text-text-muted">
                                {formatDate(rel.publishedAt || rel.createdAt)}
                              </span>
                              <span className="font-mono text-[.6rem] text-accent-orange flex items-center gap-1 opacity-0 -translate-x-1 transition-all duration-200 group-hover:opacity-100 group-hover:translate-x-0">
                                Read
                                <svg className="w-[11px] h-[11px]" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                                </svg>
                              </span>
                            </div>
                          </Link>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* ── Prev / Next ── */}
                {(prevBlog || nextBlog) && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-10">
                    {prevBlog ? (
                      <Link
                        href={`/blogs/${prevBlog.slug}`}
                        className="group bg-off-white border border-cream-deeper rounded-[.85rem] p-5 flex flex-col gap-1.5 transition-all duration-250 hover:border-sand hover:shadow-[0_5px_18px_rgba(74,55,40,.08)]"
                      >
                        <span className="font-mono text-[.58rem] tracking-[.12em] uppercase text-text-muted flex items-center gap-1.5">
                          <svg className="w-[11px] h-[11px]" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                          </svg>
                          Previous
                        </span>
                        <span className="font-heading text-[1rem] font-semibold leading-[1.25] text-ink transition-colors duration-200 group-hover:text-accent-orange">
                          {prevBlog.title}
                        </span>
                      </Link>
                    ) : (
                      <div />
                    )}
                    {nextBlog ? (
                      <Link
                        href={`/blogs/${nextBlog.slug}`}
                        className="group bg-off-white border border-cream-deeper rounded-[.85rem] p-5 flex flex-col gap-1.5 text-right transition-all duration-250 hover:border-sand hover:shadow-[0_5px_18px_rgba(74,55,40,.08)]"
                      >
                        <span className="font-mono text-[.58rem] tracking-[.12em] uppercase text-text-muted flex items-center gap-1.5 justify-end">
                          Next
                          <svg className="w-[11px] h-[11px]" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                          </svg>
                        </span>
                        <span className="font-heading text-[1rem] font-semibold leading-[1.25] text-ink transition-colors duration-200 group-hover:text-accent-orange">
                          {nextBlog.title}
                        </span>
                      </Link>
                    ) : (
                      <div />
                    )}
                  </div>
                )}
              </div>
            </article>

            {/* ── SIDEBAR ── */}
            <aside className="hidden lg:flex flex-col gap-6 sticky top-[4.5rem]">

              {/* Table of Contents */}
              <BlogTOC items={tocItems} />

              {/* Share Card */}
              <div className="bg-off-white border border-cream-deeper rounded-[.85rem] p-4">
                <div className="font-mono text-[.62rem] tracking-[.12em] uppercase text-text-muted mb-3.5 flex items-center gap-1.5">
                  <svg className="w-[13px] h-[13px]" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                  </svg>
                  Share Article
                </div>
                <div className="flex flex-col gap-2">
                  <a
                    href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(blog.title)}&url=${encodeURIComponent(shareData.url)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2.5 px-3.5 py-2.5 rounded-[.5rem] text-[.8rem] font-medium border-[1.5px] border-cream-deeper bg-off-white text-ink transition-all duration-200 hover:border-sand hover:bg-cream hover:translate-x-[2px]"
                  >
                    <svg className="w-3.5 h-3.5 flex-shrink-0" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" /></svg>
                    Share on X
                  </a>
                  <a
                    href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareData.url)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2.5 px-3.5 py-2.5 rounded-[.5rem] text-[.8rem] font-medium border-[1.5px] border-cream-deeper bg-off-white text-ink transition-all duration-200 hover:border-sand hover:bg-cream hover:translate-x-[2px]"
                  >
                    <svg className="w-3.5 h-3.5 flex-shrink-0" viewBox="0 0 24 24" fill="currentColor"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" /></svg>
                    Share on LinkedIn
                  </a>
                </div>
              </div>

              {/* Newsletter Card */}
              <div className="bg-ink rounded-[.85rem] p-5 text-off-white">
                <div className="font-heading text-[1.15rem] font-light mb-1.5">Stay in the loop</div>
                <p className="text-[.78rem] text-[rgba(240,236,227,.55)] font-light leading-[1.6] mb-4">
                  New articles on backend engineering, system design, and software — no spam, ever.
                </p>
                <input
                  type="email"
                  placeholder="your@email.com"
                  className="w-full px-3 py-2.5 border border-[rgba(255,255,255,.12)] rounded-[.45rem] bg-[rgba(255,255,255,.07)] font-body text-[.82rem] text-off-white outline-none mb-2.5 placeholder:text-[rgba(240,236,227,.35)] focus:border-[rgba(212,98,42,.6)] transition-colors"
                />
                <button className="w-full py-2.5 rounded-[.45rem] bg-accent-orange text-off-white border-none font-body text-[.82rem] font-medium cursor-pointer transition-opacity hover:opacity-[.88]">
                  Subscribe →
                </button>
              </div>
            </aside>
          </div>
        </div>

        {/* Footer spacer */}
        <div className="mt-24" />
        <Footer />
      </div>
    </>
  );
}
