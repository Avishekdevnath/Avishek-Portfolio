import LoadingScreen from '@/components/shared/LoadingScreen';

export default function PostsLoading() {
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

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="bg-white rounded-xl p-6 animate-pulse">
            <div className="flex gap-4">
              <div className="h-32 w-32 bg-gray-200 rounded-lg flex-shrink-0"></div>
              <div className="flex-1 space-y-3">
                <div className="h-6 w-3/4 bg-gray-200 rounded"></div>
                <div className="h-4 w-1/2 bg-gray-200 rounded"></div>
                <div className="h-4 w-5/6 bg-gray-200 rounded"></div>
                <div className="flex gap-2 mt-4">
                  <div className="h-6 w-16 bg-gray-200 rounded-full"></div>
                  <div className="h-6 w-16 bg-gray-200 rounded-full"></div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="flex justify-center mt-8">
        <div className="flex gap-2">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-10 w-10 bg-gray-200 rounded animate-pulse"></div>
          ))}
        </div>
      </div>
    </div>
  );
}