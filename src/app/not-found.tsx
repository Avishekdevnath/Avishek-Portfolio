import Link from 'next/link';
import NotFoundDinoGame from '@/components/shared/NotFoundDinoGame';

export default function NotFound() {
  return (
    <main className="min-h-screen bg-[#efe7da] p-4 sm:p-6">
      <section className="mx-auto max-w-4xl rounded-2xl border border-[#ddd1bf] bg-[#fffdfa] p-5 sm:p-7 shadow-lg">
        <div className="mb-4 flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-[0.68rem] font-mono uppercase tracking-[0.2em] text-[#8a7a6a]">Error 404</p>
            <h1 className="mt-1 text-2xl font-semibold text-[#2a2118] sm:text-3xl">No page here. Dino time.</h1>
            <p className="mt-2 text-sm text-[#5e4c3d] sm:text-base">
              This route does not exist. Enjoy a tiny Chrome-style runner while you are here.
            </p>
          </div>
          <div className="text-right text-[0.72rem] font-mono tracking-wide text-[#7a6a5a]">
            <p>Ultra-light mini game</p>
            <p>Space / Tap to jump</p>
          </div>
        </div>

        <NotFoundDinoGame />

        <div className="mt-6 flex flex-wrap gap-3">
          <Link
            href="/"
            className="rounded-lg bg-[#2a2118] px-4 py-2 text-sm font-medium text-[#f6f2ea] transition-colors hover:bg-[#d4622a]"
          >
            Back to Home
          </Link>
          <Link
            href="/projects"
            className="rounded-lg border border-[#d7c9b6] px-4 py-2 text-sm font-medium text-[#4b3a2d] transition-colors hover:bg-[#f4ecdf]"
          >
            See Projects
          </Link>
          <Link
            href="/contact"
            className="rounded-lg border border-[#d7c9b6] px-4 py-2 text-sm font-medium text-[#4b3a2d] transition-colors hover:bg-[#f4ecdf]"
          >
            Contact Me
          </Link>
        </div>
      </section>
    </main>
  );
}
