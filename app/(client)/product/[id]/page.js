import { Suspense } from "react"
import ProductDetails from "./ProductDetails"
import ProductLoading from "./loading"
import { getProductById } from "@/lib/products-api"

// Server Component for fetching data
export default async function ProductPage({ params }) {
  const { id } = params
  
  try {
    // Fetch product data on the server
    const product = await getProductById(id)
    
    return (
      <div className="container mx-auto px-4 py-8 max-w-7xl mt-16">
        <Suspense fallback={<ProductLoading />}>
          <ProductDetails product={product} productId={id} />
        </Suspense>
      </div>
    )
  } catch (error) {
    console.error(`Error loading product ${id}:`, error)
    return (
      <div className="container mx-auto px-4 py-16 flex justify-center items-center min-h-[60vh]">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-700 mb-4">Product Not Found</h2>
          <p className="text-gray-600 mb-8">The product you're looking for doesn't exist or has been removed.</p>
          <a href="/products" className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2">
            Back to Products
          </a>
        </div>
      </div>
    )
  }
}