export default function ProductLoading() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
      {/* Product Image Loading Skeleton */}
      <div className="relative">
        <div className="relative aspect-square overflow-hidden rounded-lg bg-gray-200 animate-pulse">
        </div>
        <div className="flex gap-2 mt-4 justify-center">
          {[...Array(4)].map((_, index) => (
            <div key={index} className="w-16 h-16 rounded-md bg-gray-200 animate-pulse"></div>
          ))}
        </div>
      </div>

      {/* Product Details Loading Skeleton */}
      <div className="flex flex-col gap-6">
        <div className="h-10 bg-gray-200 rounded-md w-3/4 animate-pulse"></div>
        <div className="h-5 bg-gray-200 rounded-md w-1/4 animate-pulse"></div>
        <div className="h-8 bg-gray-200 rounded-md w-1/3 animate-pulse"></div>
        <div className="space-y-2">
          <div className="h-4 bg-gray-200 rounded-md w-full animate-pulse"></div>
          <div className="h-4 bg-gray-200 rounded-md w-full animate-pulse"></div>
          <div className="h-4 bg-gray-200 rounded-md w-2/3 animate-pulse"></div>
        </div>
        <div className="h-8 bg-gray-200 rounded-md w-1/2 animate-pulse"></div>
        <div className="h-10 bg-gray-200 rounded-md w-1/3 animate-pulse"></div>
        <div className="h-12 bg-gray-200 rounded-md w-full animate-pulse"></div>
        <div className="flex gap-3">
          <div className="h-12 bg-gray-200 rounded-md w-1/2 animate-pulse"></div>
          <div className="h-12 bg-gray-200 rounded-md w-1/2 animate-pulse"></div>
        </div>
      </div>
    </div>
  )
}