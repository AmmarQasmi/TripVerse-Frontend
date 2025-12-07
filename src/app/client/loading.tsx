'use client'

export default function ClientLoading() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8 space-y-12">
        {/* Top stat doughnut skeletons (matches dashboard overview layout) */}
        <section>
          <div className="h-8 w-48 mx-auto mb-8 rounded-full bg-gray-200/80 animate-pulse" />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
            {Array.from({ length: 5 }).map((_, index) => (
              <div
                key={index}
                className="flex flex-col items-center gap-4"
              >
                <div className="relative w-full max-w-[200px] mx-auto aspect-square rounded-full bg-gray-200/80 animate-pulse" />
                <div className="h-4 w-24 rounded-full bg-gray-200/80 animate-pulse" />
              </div>
            ))}
          </div>
        </section>

        {/* Generic cards/rows skeleton used by list pages (cars, hotels, bookings, etc.) */}
        <section className="space-y-4">
          <div className="h-7 w-40 rounded-full bg-gray-200/80 animate-pulse" />
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, index) => (
              <div
                key={index}
                className="rounded-2xl bg-white shadow-sm border border-gray-200 overflow-hidden"
              >
                <div className="p-6 space-y-3 animate-pulse bg-gray-50">
                  <div className="h-4 w-1/3 rounded-full bg-gray-200/90" />
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div className="h-3 rounded-full bg-gray-200/90" />
                    <div className="h-3 rounded-full bg-gray-200/80" />
                    <div className="h-3 rounded-full bg-gray-200/70" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  )
}


