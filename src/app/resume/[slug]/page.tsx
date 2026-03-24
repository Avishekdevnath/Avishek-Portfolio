import type { Metadata } from 'next';
import { notFound, permanentRedirect } from 'next/navigation';
import Link from 'next/link';
import Header from '@/components/shared/Header';
import Footer from '@/components/shared/Footer';
import connectDB from '@/lib/mongodb';
import { ResumeVariant } from '@/models/ResumeVariant';
import { getSiteUrl } from '@/lib/url';

interface ResumePageProps {
  params: {
    slug: string;
  };
}

export const revalidate = 0;

export async function generateMetadata({ params }: ResumePageProps): Promise<Metadata> {
  await connectDB();

  const variant: any =
    (await ResumeVariant.findOne({ slug: params.slug, publicViewEnabled: true, status: 'ready' })) ||
    (await ResumeVariant.findOne({ slugHistory: params.slug, publicViewEnabled: true, status: 'ready' }));

  if (!variant) {
    return {
      title: 'Resume Not Found',
      description: 'The requested resume is not available.',
    };
  }

  const canonicalPath = `/resume/${variant.slug}`;

  return {
    title: `${variant.title} | Resume`,
    description: variant.summary || `Public resume variant: ${variant.title}`,
    alternates: { canonical: canonicalPath },
    openGraph: {
      title: `${variant.title} | Resume`,
      description: variant.summary || `Public resume variant: ${variant.title}`,
      url: canonicalPath,
      type: 'website',
    },
    robots: 'index,follow',
  };
}

export default async function ResumeSlugPage({ params }: ResumePageProps) {
  await connectDB();

  let variant: any = await ResumeVariant.findOne({
    slug: params.slug,
    publicViewEnabled: true,
    status: 'ready',
  }).lean();

  if (!variant) {
    const legacy: any = await ResumeVariant.findOne({
      slugHistory: params.slug,
      publicViewEnabled: true,
      status: 'ready',
    }).lean();

    if (legacy) {
      permanentRedirect(`/resume/${legacy.slug}`);
    }

    notFound();
  }

  const siteUrl = getSiteUrl();
  const canonical = `${siteUrl}/resume/${variant.slug}`;

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'CreativeWork',
            name: variant.title,
            description: variant.summary || `Public resume variant: ${variant.title}`,
            url: canonical,
            encodingFormat: 'application/pdf',
            inLanguage: 'en',
            keywords: variant.focusTags || [],
          }),
        }}
      />

      <div className="min-h-screen bg-cream font-body">
        <div className="pt-6">
          <Header />
        </div>

        <main className="max-w-[1100px] mx-auto px-6 py-12">
          <nav className="mb-5">
            <Link href="/resume" className="font-mono text-[0.65rem] tracking-[0.1em] uppercase text-text-muted hover:text-accent-orange transition-colors">
              ← Back to Resume Hub
            </Link>
          </nav>

          <header className="mb-6 flex flex-wrap items-start justify-between gap-4">
            <div>
              <h1 className="font-heading text-[clamp(1.9rem,4.8vw,2.8rem)] font-light text-ink">{variant.title}</h1>
              <p className="text-[0.75rem] font-mono text-text-muted mt-1">/resume/{variant.slug}</p>
              {variant.summary ? (
                <p className="text-[0.9rem] text-text-muted mt-3 max-w-[70ch]">{variant.summary}</p>
              ) : null}
            </div>

            <div className="flex items-center gap-2">
              <a
                href={`/r/${variant.slug}`}
                target="_blank"
                rel="noopener noreferrer"
                className="px-3 py-2 rounded-lg bg-ink text-off-white text-[0.8rem] hover:bg-accent-orange transition-colors"
              >
                Open PDF
              </a>
              <a
                href={`/r/${variant.slug}?download=1`}
                download={variant.fileName || 'resume.pdf'}
                className="px-3 py-2 rounded-lg border border-cream-deeper text-ink text-[0.8rem] hover:border-sand transition-colors"
              >
                Download
              </a>
            </div>
          </header>

          <section className="bg-off-white border border-cream-deeper rounded-xl overflow-hidden">
            <iframe
              title={`${variant.title} PDF`}
              src={`/r/${variant.slug}`}
              className="w-full h-[78vh]"
            />
          </section>
        </main>

        <Footer />
      </div>
    </>
  );
}
