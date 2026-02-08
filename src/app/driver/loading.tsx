'use client'

export default function DriverLoading() {
  return (
    <div className="min-h-screen bg-gray-50 animate-pulse">
      {/* Page Header Skeleton */}
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between mb-4">
          <div className="h-10 w-32 bg-gray-200 rounded-lg" />
        </div>
        <div className="h-7 w-64 bg-gray-200 rounded mb-2" />
        <div className="h-4 w-48 bg-gray-200/60 rounded" />
      </div>

      <div className="container mx-auto px-4 py-8 space-y-8">
        {/* Stats Row */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
              <div className="h-4 w-24 bg-gray-200 rounded mb-3" />
              <div className="h-8 w-20 bg-gray-200/80 rounded" />
            </div>
          ))}
        </div>

        {/* Content Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
              <div className="h-5 w-40 bg-gray-200 rounded mb-4" />
              <div className="space-y-3">
                <div className="h-4 bg-gray-200/60 rounded w-full" />
                <div className="h-4 bg-gray-200/60 rounded w-3/4" />
                <div className="h-4 bg-gray-200/60 rounded w-1/2" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
