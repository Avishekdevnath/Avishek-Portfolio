import type { Metadata } from 'next';
import Link from 'next/link';
import Header from '@/components/shared/Header';
import Footer from '@/components/shared/Footer';
import connectDB from '@/lib/mongodb';
import { ResumeVariant } from '@/models/ResumeVariant';

export const metadata: Metadata = {
  title: 'Resumes | Avishek Devnath',
  description: 'Public resume variants tailored to different roles and focus areas.',
  alternates: { canonical: '/resume' },
  openGraph: {
    title: 'Resumes | Avishek Devnath',
    description: 'Explore role-specific resume variants and download directly.',
    url: '/resume',
    type: 'website',
  },
};

export const revalidate = 0;

export default async function ResumeListingPage() {
  await connectDB();

  const variants = await ResumeVariant.find({ publicViewEnabled: true, status: 'ready', fileUrl: { $ne: null } })
    .sort({ isPrimary: -1, updatedAt: -1 })
    .lean();

  return (
    <div className="min-h-screen bg-cream font-body">
      <div className="pt-6">
        <Header />
      </div>

      <main className="max-w-[1000px] mx-auto px-6 py-16">
        <div className="mb-10">
          <p className="text-[0.65rem] font-mono tracking-[0.15em] uppercase text-text-muted mb-3">Public Resume Hub</p>
          <h1 className="font-heading text-[clamp(2rem,5vw,3rem)] font-light text-ink">Role-Specific Resumes</h1>
          <p className="text-[0.95rem] text-text-muted mt-3 max-w-[65ch]">
            Choose the variant that best matches your hiring context. Every resume page is public, indexable, and directly shareable.
          </p>
        </div>

        {variants.length === 0 ? (
          <div className="bg-off-white border border-cream-deeper rounded-xl p-8 text-text-muted text-center">
            No public resume variants are available yet.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {variants.map((variant: any) => (
              <article key={String(variant._id)} className="bg-off-white border border-cream-deeper rounded-xl p-5">
                <div className="flex items-center justify-between gap-2">
                  <h2 className="text-[1rem] font-semibold text-ink">{variant.title}</h2>
                  {variant.isPrimary ? (
                    <span className="text-[0.6rem] font-mono uppercase tracking-[0.1em] px-2 py-0.5 rounded-full border border-[rgba(212,98,42,.3)] text-accent-orange">
                      Primary
                    </span>
                  ) : null}
                </div>

                <p className="text-[0.78rem] font-mono text-text-muted mt-1">/resume/{variant.slug}</p>

                {variant.summary ? (
                  <p className="text-[0.85rem] text-text-muted mt-3 leading-relaxed">{variant.summary}</p>
                ) : null}

                {variant.focusTags?.length ? (
                  <div className="flex flex-wrap gap-1.5 mt-3">
                    {variant.focusTags.map((tag: string) => (
                      <span
                        key={`${variant.slug}-${tag}`}
                        className="font-mono text-[0.62rem] text-accent-orange tracking-[.04em] px-2.5 py-1 rounded-full bg-[rgba(212,98,42,.08)] border border-[rgba(212,98,42,.18)]"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                ) : null}

                <div className="flex items-center gap-2 mt-5">
                  <Link
                    href={`/resume/${variant.slug}`}
                    className="px-3 py-2 rounded-lg bg-ink text-off-white text-[0.8rem] hover:bg-accent-orange transition-colors"
                  >
                    View Resume
                  </Link>
                  <a
                    href={variant.fileUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3 py-2 rounded-lg border border-cream-deeper text-[0.8rem] text-ink hover:border-sand transition-colors"
                  >
                    Download PDF
                  </a>
                </div>
              </article>
            ))}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
