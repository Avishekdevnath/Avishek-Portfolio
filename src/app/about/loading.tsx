export default function LoadingAbout() {
  return (
    <div className="min-h-screen bg-white font-ui">
      <main className="container mx-auto px-4 py-16">
        {/* Page Header Skeleton */}
        <div className="text-center mb-10">
          <div className="h-6 w-40 bg-gray-200 rounded mx-auto mb-2 animate-pulse" />
          <div className="h-8 w-56 bg-gray-200 rounded mx-auto mb-3 animate-pulse" />
          <div className="h-4 w-80 bg-gray-200 rounded mx-auto animate-pulse" />
        </div>

        {/* About Content Skeleton */}
        <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Left column (avatar/bio card) */}
          <div className="md:col-span-1 space-y-4">
            <div className="h-40 w-40 mx-auto rounded-full bg-gray-200 animate-pulse" />
            <div className="h-4 w-32 bg-gray-200 rounded mx-auto animate-pulse" />
            <div className="h-3 w-24 bg-gray-200 rounded mx-auto animate-pulse" />
          </div>

          {/* Right column (text blocks) */}
          <div className="md:col-span-2 space-y-4">
            <div className="h-5 w-2/3 bg-gray-200 rounded animate-pulse" />
            <div className="h-4 w-full bg-gray-200 rounded animate-pulse" />
            <div className="h-4 w-11/12 bg-gray-200 rounded animate-pulse" />
            <div className="h-4 w-5/6 bg-gray-200 rounded animate-pulse" />
            <div className="h-4 w-2/3 bg-gray-200 rounded animate-pulse" />
          </div>
        </div>

        {/* Skills/Stats skeleton */}
        <div className="max-w-5xl mx-auto mt-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="border border-gray-200 rounded-lg p-5">
              <div className="h-5 w-1/2 bg-gray-200 rounded mb-3 animate-pulse" />
              <div className="space-y-2">
                <div className="h-3 w-full bg-gray-200 rounded animate-pulse" />
                <div className="h-3 w-5/6 bg-gray-200 rounded animate-pulse" />
                <div className="h-3 w-2/3 bg-gray-200 rounded animate-pulse" />
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}


