'use client';

interface StatsItem {
  [key: string]: {
    saved: number;
    applied: number;
    discarded: number;
  };
}

interface Props {
  stats: StatsItem;
}

export default function PlatformStatsWidget({ stats }: Props) {
  const entries = Object.entries(stats);

  const prettifyPlatformName = (name: string) =>
    name
      .split(' ')
      .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
      .join(' ');

  if (entries.length === 0) {
    return null;
  }

  return (
    <div className="bg-gray-50 rounded-lg p-4 mb-6 border border-gray-200">
      <h3 className="text-sm font-semibold text-gray-700 mb-3">Bookmarks by Platform</h3>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
        {entries.map(([platform, counts]) => {
          const total = counts.saved + counts.applied + counts.discarded;
          return (
            <div key={platform} className="bg-white rounded p-3 border border-gray-200">
              <p className="text-xs font-semibold text-gray-700 mb-2">{prettifyPlatformName(platform)}</p>
              <div className="text-xs space-y-1">
                <p className="text-blue-600">Saved: <span className="font-semibold">{counts.saved}</span></p>
                <p className="text-green-600">Applied: <span className="font-semibold">{counts.applied}</span></p>
                <p className="text-red-600">Discarded: <span className="font-semibold">{counts.discarded}</span></p>
              </div>
              <p className="text-xs text-gray-500 mt-2 pt-2 border-t">Total: {total}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
