export default function ProjectsLoading() {
  return (
    <div className="min-h-screen bg-white font-ui">
      <main className="container mx-auto px-4 py-16">
        <div className="text-center mb-10">
          <div className="h-8 w-56 bg-gray-200 rounded mx-auto mb-3 animate-pulse" />
          <div className="h-4 w-96 max-w-full bg-gray-200 rounded mx-auto animate-pulse" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {Array.from({ length: 6 }).map((_, idx) => (
            <div key={idx} className="border border-gray-200 rounded-lg overflow-hidden">
              <div className="h-40 bg-gray-200 animate-pulse" />
              <div className="p-5 space-y-3">
                <div className="h-5 w-3/4 bg-gray-200 rounded animate-pulse" />
                <div className="h-4 w-full bg-gray-200 rounded animate-pulse" />
                <div className="h-4 w-5/6 bg-gray-200 rounded animate-pulse" />
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}


