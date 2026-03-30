import type { StatusHistoryEntry } from '@/types/job-hunt';

const STATUS_COLORS: Record<string, string> = {
  Applied: 'bg-blue-100 text-blue-700',
  'Phone Screen': 'bg-purple-100 text-purple-700',
  Interview: 'bg-amber-100 text-amber-700',
  Offer: 'bg-green-100 text-green-700',
  Rejected: 'bg-red-100 text-red-700',
  'No Response': 'bg-gray-100 text-gray-600',
};

interface Props {
  history: StatusHistoryEntry[];
}

export default function StatusTimeline({ history }: Props) {
  if (!history || history.length === 0) return null;

  return (
    <div className="mt-6">
      <p className="text-[0.65rem] font-mono tracking-[0.12em] uppercase text-[#8a7a6a] mb-3">Status History</p>
      <div className="relative pl-4 border-l-2 border-[#e8e3db] space-y-3">
        {[...history].reverse().map((entry, i) => (
          <div key={i} className="relative flex items-center gap-3">
            <span className="absolute -left-[1.1rem] w-2 h-2 rounded-full bg-[#d4622a]" />
            <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${STATUS_COLORS[entry.status] ?? 'bg-gray-100 text-gray-600'}`}>
              {entry.status}
            </span>
            <span className="text-[0.72rem] text-[#8a7a6a]">
              {new Date(entry.changedAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
            </span>
            {entry.note && <span className="text-[0.72rem] text-[#6b5c4e] italic">{entry.note}</span>}
          </div>
        ))}
      </div>
    </div>
  );
}
