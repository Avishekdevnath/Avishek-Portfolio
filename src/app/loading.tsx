export default function RootLoading() {
  return (
    <div className="min-h-screen bg-cream font-ui">
      <main className="container mx-auto px-4 py-16">
        <div className="space-y-6">
          <div className="h-8 w-56 bg-cream-dark rounded animate-pulse" />
          <div className="h-4 w-80 bg-cream-dark rounded animate-pulse" />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="border border-cream-deeper rounded-lg overflow-hidden">
                <div className="h-40 bg-cream-dark animate-pulse" />
                <div className="p-4 space-y-3">
                  <div className="h-5 w-3/4 bg-cream-dark rounded animate-pulse" />
                  <div className="h-4 w-full bg-cream-dark rounded animate-pulse" />
                  <div className="h-4 w-5/6 bg-cream-dark rounded animate-pulse" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
