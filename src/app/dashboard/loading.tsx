export default function DashboardLoading() {
  return (
    <div className="space-y-8">
      {/* Welcome Section Skeleton */}
      <div className="bg-white rounded-xl p-6 animate-pulse">
        <div className="flex items-center gap-4 mb-6">
          <div className="h-16 w-16 bg-gray-200 rounded-full"></div>
          <div>
            <div className="h-6 w-48 bg-gray-200 rounded mb-2"></div>
            <div className="h-4 w-32 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>

      {/* Stats Grid Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
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

      {/* Recent Activity Skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Projects */}
        <div className="bg-white rounded-xl p-6">
          <div className="h-6 w-32 bg-gray-200 rounded mb-4"></div>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center gap-4 animate-pulse">
                <div className="h-12 w-12 bg-gray-200 rounded"></div>
                <div className="flex-1">
                  <div className="h-4 w-3/4 bg-gray-200 rounded mb-2"></div>
                  <div className="h-3 w-1/2 bg-gray-200 rounded"></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Messages */}
        <div className="bg-white rounded-xl p-6">
          <div className="h-6 w-32 bg-gray-200 rounded mb-4"></div>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-start gap-4 animate-pulse">
                <div className="h-10 w-10 bg-gray-200 rounded-full"></div>
                <div className="flex-1">
                  <div className="h-4 w-1/4 bg-gray-200 rounded mb-2"></div>
                  <div className="h-3 w-3/4 bg-gray-200 rounded"></div>
                </div>
                <div className="h-4 w-16 bg-gray-200 rounded"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}