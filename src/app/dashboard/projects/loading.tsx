import LoadingScreen from '@/components/shared/LoadingScreen';

export default function ProjectsLoading() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="animate-pulse">
          <div className="h-8 w-48 bg-gray-200 rounded mb-2"></div>
          <div className="h-4 w-32 bg-gray-200 rounded"></div>
        </div>
        <div className="animate-pulse">
          <div className="h-10 w-32 bg-gray-200 rounded"></div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="bg-white rounded-xl p-6 animate-pulse">
            <div className="h-48 bg-gray-200 rounded-lg mb-4"></div>
            <div className="space-y-3">
              <div className="h-6 w-3/4 bg-gray-200 rounded"></div>
              <div className="h-4 w-1/2 bg-gray-200 rounded"></div>
              <div className="h-4 w-5/6 bg-gray-200 rounded"></div>
              <div className="flex gap-2 mt-4">
                <div className="h-8 w-20 bg-gray-200 rounded-full"></div>
                <div className="h-8 w-20 bg-gray-200 rounded-full"></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}