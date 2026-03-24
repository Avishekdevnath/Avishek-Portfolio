import Link from 'next/link';

const cards = [
  {
    title: 'Platform Store',
    description: 'Manage source platforms with referral notes and curated job counts.',
    href: '/dashboard/job-hunt/platforms',
  },
  {
    title: 'Applications',
    description: 'Track every application with status and follow-up visibility.',
    href: '/dashboard/job-hunt/applications',
  },
  {
    title: 'Log New Application',
    description: 'Quickly add a newly submitted application.',
    href: '/dashboard/job-hunt/applications/new',
  },
  {
    title: 'Job Leads',
    description: 'Fetch and manage potential roles from external sources manually.',
    href: '/dashboard/job-hunt/leads',
  },
  {
    title: 'Daily Activity Log',
    description: 'Capture daily job hunt efforts with follow-up and priority tracking.',
    href: '/dashboard/job-hunt/activities',
  },
  {
    title: 'Interview Tracker',
    description: 'Track rounds, interview outcomes, and preparation notes.',
    href: '/dashboard/job-hunt/interviews',
  },
  {
    title: 'Contacts & Networking',
    description: 'Manage recruiter and networking relationships in one place.',
    href: '/dashboard/job-hunt/contacts',
  },
  {
    title: 'Analytics',
    description: 'View funnel, follow-up load, and month-by-month response trends.',
    href: '/dashboard/job-hunt/analytics',
  },
];

export default function JobHuntOverviewPage() {
  return (
    <div className="space-y-5">
      <div>
        <p className="text-[0.65rem] font-mono tracking-[0.15em] uppercase text-[#8a7a6a]">Private Workspace</p>
        <h1 className="text-[1.15rem] font-semibold text-[#2a2118] mt-1">Job Hunt</h1>
        <p className="text-[0.85rem] text-[#6b5c4e] mt-1">
          Local-only dashboard module for tracking applications and leads.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {cards.map((card) => (
          <Link
            key={card.href}
            href={card.href}
            className="bg-white border border-[#e8e3db] rounded-xl p-5 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all"
          >
            <p className="text-[0.92rem] font-semibold text-[#2a2118]">{card.title}</p>
            <p className="text-[0.78rem] text-[#8a7a6a] mt-1.5 leading-relaxed">{card.description}</p>
            <p className="text-[0.68rem] font-mono text-[#d4622a] mt-3 tracking-wide">Open →</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
