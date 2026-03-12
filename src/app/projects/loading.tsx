export default function ProjectsLoading() {
  return (
    <div className="min-h-screen bg-cream font-body">
      <main className="max-w-[1100px] mx-auto px-6 py-16">
        {/* Header Skeleton */}
        <div className="text-center mb-12">
          <div className="h-3 w-32 bg-cream-dark rounded-full mx-auto mb-4 animate-pulse" />
          <div className="h-10 w-64 bg-cream-dark rounded mx-auto mb-4 animate-pulse" />
          <div className="h-4 w-96 max-w-full bg-cream-dark rounded mx-auto animate-pulse" />
        </div>

        {/* Controls Skeleton */}
        <div className="flex items-center gap-3 mb-6 flex-wrap">
          <div className="h-9 w-[200px] bg-cream-dark rounded-full animate-pulse" />
          <div className="flex gap-2">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-8 w-16 bg-cream-dark rounded-full animate-pulse" />
            ))}
          </div>
          <div className="ml-auto flex items-center gap-2">
            <div className="h-4 w-24 bg-cream-dark rounded animate-pulse" />
            <div className="h-8 w-16 bg-cream-dark rounded-lg animate-pulse" />
          </div>
        </div>

        {/* Grid Skeleton */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-[1.15rem]">
          {Array.from({ length: 6 }).map((_, idx) => (
            <div key={idx} className="border border-cream-deeper rounded-[0.85rem] overflow-hidden bg-off-white">
              <div className="h-[155px] bg-cream-dark animate-pulse" />
              <div className="h-[3px] bg-cream-deeper" />
              <div className="p-[1.1rem_1.2rem] space-y-3">
                <div className="h-5 w-3/4 bg-cream-dark rounded animate-pulse" />
                <div className="space-y-1.5">
                  <div className="h-3 w-full bg-cream-dark rounded animate-pulse" />
                  <div className="h-3 w-5/6 bg-cream-dark rounded animate-pulse" />
                </div>
                <div className="flex gap-2">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <div key={i} className="h-5 w-14 bg-cream-dark rounded-full animate-pulse" />
                  ))}
                </div>
              </div>
              <div className="px-[1.2rem] py-[0.82rem] border-t border-cream-deeper flex gap-3">
                <div className="h-4 w-12 bg-cream-dark rounded animate-pulse" />
                <div className="h-4 w-12 bg-cream-dark rounded animate-pulse" />
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
