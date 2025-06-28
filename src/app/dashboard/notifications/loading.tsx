export default function NotificationsLoading() {
  return (
    <div className="space-y-6">
      {/* Header Skeleton */}
      <div className="animate-pulse">
        <div className="h-8 w-48 bg-gray-200 rounded mb-2"></div>
        <div className="h-4 w-64 bg-gray-200 rounded"></div>
      </div>

      {/* Stats Grid Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="bg-white rounded-xl p-6 animate-pulse">
            <div className="flex items-center justify-between">
              <div>
                <div className="h-4 w-16 bg-gray-200 rounded mb-2"></div>
                <div className="h-8 w-12 bg-gray-200 rounded"></div>
              </div>
              <div className="h-12 w-12 bg-gray-200 rounded-lg"></div>
            </div>
          </div>
        ))}
      </div>

      {/* Search and Filters Skeleton */}
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="flex-1">
          <div className="h-10 bg-gray-200 rounded-lg w-full"></div>
        </div>
        <div className="flex gap-4">
          <div className="h-10 w-32 bg-gray-200 rounded-lg"></div>
          <div className="h-10 w-32 bg-gray-200 rounded-lg"></div>
        </div>
      </div>

      {/* Notifications List Skeleton */}
      <div className="space-y-4">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="bg-white rounded-xl p-6 animate-pulse">
            <div className="flex items-start gap-4">
              <div className="h-10 w-10 bg-gray-200 rounded-full flex-shrink-0"></div>
              <div className="flex-1 space-y-3">
                <div className="flex items-center gap-2">
                  <div className="h-5 w-24 bg-gray-200 rounded"></div>
                  <div className="h-5 w-16 bg-gray-200 rounded"></div>
                </div>
                <div className="h-4 w-3/4 bg-gray-200 rounded"></div>
                <div className="h-4 w-1/2 bg-gray-200 rounded"></div>
              </div>
              <div className="flex gap-2">
                <div className="h-8 w-8 bg-gray-200 rounded"></div>
                <div className="h-8 w-8 bg-gray-200 rounded"></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}