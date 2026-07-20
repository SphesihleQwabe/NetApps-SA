// src/components/ui/LoadingSkeleton.tsx

export function LoadingSkeleton() {
  return (
    <div className="animate-pulse">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <div className="h-8 w-48 bg-gray-200 rounded-lg"></div>
          <div className="h-4 w-32 bg-gray-100 rounded-lg mt-2"></div>
        </div>
        <div className="flex gap-3">
          <div className="h-10 w-24 bg-gray-200 rounded-lg"></div>
          <div className="h-10 w-32 bg-gray-200 rounded-lg"></div>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="bg-white rounded-xl p-4 border border-gray-100">
            <div className="h-4 w-24 bg-gray-200 rounded"></div>
            <div className="h-8 w-16 bg-gray-200 rounded mt-2"></div>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="flex items-center gap-4 py-3 border-b border-gray-100">
              <div className="h-6 w-6 bg-gray-200 rounded"></div>
              <div className="h-10 w-10 bg-gray-200 rounded-lg"></div>
              <div className="flex-1">
                <div className="h-4 w-32 bg-gray-200 rounded"></div>
                <div className="h-3 w-48 bg-gray-100 rounded mt-1"></div>
              </div>
              <div className="h-4 w-20 bg-gray-200 rounded"></div>
              <div className="h-4 w-16 bg-gray-200 rounded"></div>
              <div className="h-6 w-16 bg-gray-200 rounded-full"></div>
              <div className="flex gap-2">
                <div className="h-8 w-8 bg-gray-200 rounded"></div>
                <div className="h-8 w-8 bg-gray-200 rounded"></div>
                <div className="h-8 w-8 bg-gray-200 rounded"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}