"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import { useParams, useRouter } from "next/navigation"
import { ChevronLeft, ChevronRight, Minus, Plus, ShoppingCart, Star, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { getProductById } from "@/lib/products-api"
import { formatCurrency } from "@/lib/utils"

export default function ProductPage() {
  const router = useRouter()
  const { id } = useParams()
  const [currentImage, setCurrentImage] = useState(0)
  const [quantity, setQuantity] = useState(1)
  const [selectedColor, setSelectedColor] = useState("")
  const [selectedSize, setSelectedSize] = useState("")
  const [product, setProduct] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // Fetch product data
  useEffect(() => {
    async function loadProduct() {
      try {
        setLoading(true)
        const productData = await getProductById(id)
        setProduct(productData)
        
        // Set default selected color and size if available
        if (productData.colors && productData.colors.length > 0) {
          setSelectedColor(productData.colors[0].color.name)
        }
        
        if (productData.sizes && productData.sizes.length > 0) {
          setSelectedSize(productData.sizes[0].size.name)
        }
      } catch (err) {
        console.error("Error loading product:", err)
        setError("Failed to load product details. Please try again later.")
      } finally {
        setLoading(false)
      }
    }
    
    if (id) {
      loadProduct()
    }
  }, [id])

  // Handle image carousel
  const nextImage = () => {
    if (product?.images?.length > 0) {
      setCurrentImage((prev) => (prev + 1) % product.images.length)
    } else {
      // If no multiple images, just use the main product image
      setCurrentImage(0)
    }
  }

  const prevImage = () => {
    if (product?.images?.length > 0) {
      setCurrentImage((prev) => (prev - 1 + product.images.length) % product.images.length)
    } else {
      setCurrentImage(0)
    }
  }

  // Quantity controls
  const increaseQuantity = () => setQuantity((prev) => prev + 1)
  const decreaseQuantity = () => setQuantity((prev) => Math.max(1, prev - 1))

  // Handle buy now
  const handleBuyNow = () => {
    // Navigate to checkout page with product details
    router.push(
      `/checkout?product=${encodeURIComponent(product.name)}&color=${selectedColor}&size=${selectedSize}&quantity=${quantity}`,
    )
  }
  
  // Get product images
  const getProductImages = () => {
    if (!product) return ["/placeholder.svg"]
    
    // If product has multiple images stored in an 'images' array property
    if (product.images && product.images.length > 0) {
      return product.images
    }
    
    // Otherwise just return the main product image
    return [product.imageUrl]
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-16 flex justify-center items-center min-h-[60vh]">
        <div className="flex flex-col items-center">
          <Loader2 className="h-12 w-12 animate-spin text-gray-400" />
          <p className="mt-4 text-gray-600">Loading product details...</p>
        </div>
      </div>
    )
  }

  if (error || !product) {
    return (
      <div className="container mx-auto px-4 py-16 flex justify-center items-center min-h-[60vh]">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-700 mb-4">Product Not Found</h2>
          <p className="text-gray-600 mb-8">{error || "The product you're looking for doesn't exist or has been removed."}</p>
          <Button onClick={() => router.push('/products')}>
            Back to Products
          </Button>
        </div>
      </div>
    )
  }

  // Extract product colors and sizes
  const productColors = product.colors.map(c => c.color.name)
  const productSizes = product.sizes.map(s => s.size.name)
  const images = getProductImages()

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl mt-16">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Product Images Carousel */}
        <div className="relative">
          <div className="relative aspect-square overflow-hidden rounded-lg bg-gray-100">
            <Image
              src={images[currentImage] || "/placeholder.svg"}
              alt={`${product.name} - Image ${currentImage + 1}`}
              fill
              className="object-cover"
              priority
            />

            {/* Carousel Navigation Buttons */}
            {images.length > 1 && (
              <>
                <button
                  onClick={prevImage}
                  className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/80 rounded-full p-2 shadow-md hover:bg-white transition-colors"
                  aria-label="Previous image"
                >
                  <ChevronLeft className="h-6 w-6" />
                </button>

                <button
                  onClick={nextImage}
                  className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/80 rounded-full p-2 shadow-md hover:bg-white transition-colors"
                  aria-label="Next image"
                >
                  <ChevronRight className="h-6 w-6" />
                </button>
              </>
            )}
          </div>

          {/* Thumbnail Navigation */}
          {images.length > 1 && (
            <div className="flex gap-2 mt-4 justify-center">
              {images.map((image, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentImage(index)}
                  className={`relative w-16 h-16 rounded-md overflow-hidden ${
                    currentImage === index ? "ring-2 ring-black" : "opacity-70"
                  }`}
                >
                  <Image src={image || "/placeholder.svg"} alt={`Thumbnail ${index + 1}`} fill className="object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Product Details */}
        <div className="flex flex-col gap-6">
          <div>
            <h1 className="text-3xl font-bold">{product.name}</h1>
            <div className="flex items-center gap-2 mt-2">
              <div className="flex">
                {[...Array(5)].map((_, i) => {
                  // Use product.rating if available, otherwise show 5 stars
                  const rating = product.rating || 5;
                  return (
                    <Star
                      key={i}
                      className={`h-5 w-5 ${
                        i < Math.floor(rating) ? "text-yellow-400 fill-yellow-400" : "text-gray-300"
                      }`}
                    />
                  );
                })}
              </div>
              <span className="text-sm text-gray-600">
                {product.rating || 5} ({product.reviews || 0} reviews)
              </span>
            </div>
          </div>

          <div className="text-2xl font-bold">{formatCurrency(product.price)}</div>

          <p className="text-gray-700">{product.description || "No description available."}</p>

          {/* Color Selection */}
          {productColors.length > 0 && (
            <div>
              <h3 className="font-medium mb-2">Color</h3>
              <div className="flex gap-2">
                {productColors.map((color) => (
                  <button
                    key={color}
                    onClick={() => setSelectedColor(color)}
                    className={`border rounded-md px-3 py-1 transition-all ${
                      selectedColor === color ? "border-black bg-black text-white" : "hover:border-black"
                    }`}
                  >
                    {color}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Size Selection */}
          {productSizes.length > 0 && (
            <div>
              <h3 className="font-medium mb-2">Size</h3>
              <div className="flex flex-wrap gap-2">
                {productSizes.map((size) => (
                  <button
                    key={size}
                    onClick={() => setSelectedSize(size)}
                    className={`w-12 h-10 flex items-center justify-center border rounded-md transition-all ${
                      selectedSize === size ? "border-black bg-black text-white" : "hover:border-black"
                    }`}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Stock Information */}
          <div>
            <span className={`font-medium ${product.stock > 0 ? 'text-green-600' : 'text-red-600'}`}>
              {product.stock > 0 
                ? `In Stock (${product.stock} available)`
                : 'Out of Stock'
              }
            </span>
          </div>

          {/* Quantity Selector */}
          <div>
            <h3 className="font-medium mb-2">Quantity</h3>
            <div className="flex items-center border rounded-md w-fit">
              <button 
                onClick={decreaseQuantity} 
                className="px-3 py-2 hover:bg-gray-100" 
                aria-label="Decrease quantity"
                disabled={product.stock <= 0}
              >
                <Minus className="h-4 w-4" />
              </button>
              <span className="px-4 py-2 border-x">{quantity}</span>
              <button 
                onClick={increaseQuantity} 
                className="px-3 py-2 hover:bg-gray-100" 
                aria-label="Increase quantity"
                disabled={product.stock <= 0 || quantity >= product.stock}
              >
                <Plus className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3">
            <Button 
              className="flex-1 flex items-center gap-2" 
              variant="outline"
              disabled={product.stock <= 0}
            >
              <ShoppingCart className="h-5 w-5" />
              Add to Cart
            </Button>
            <Button 
              className="flex-1" 
              onClick={handleBuyNow}
              disabled={product.stock <= 0}
            >
              Buy Now
            </Button>
          </div>

          {/* Product Details Tabs */}
          <Card className="mt-6">
            <Tabs defaultValue="description">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="description">Description</TabsTrigger>
                <TabsTrigger value="specs">Specifications</TabsTrigger>
                <TabsTrigger value="shipping">Shipping</TabsTrigger>
              </TabsList>
              <TabsContent value="description" className="p-4">
                <p className="text-gray-700">{product.description || "No detailed description available for this product."}</p>
              </TabsContent>
              <TabsContent value="specs" className="p-4">
                <div className="grid grid-cols-2 gap-2">
                  <div className="flex justify-between">
                    <span className="font-medium">Category:</span>
                    <span>{product.category?.name || "Uncategorized"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium">SKU:</span>
                    <span>{product.id.substring(0, 8)}</span>
                  </div>
                  {product.weight && (
                    <div className="flex justify-between">
                      <span className="font-medium">Weight:</span>
                      <span>{product.weight}</span>
                    </div>
                  )}
                  {product.dimensions && (
                    <div className="flex justify-between">
                      <span className="font-medium">Dimensions:</span>
                      <span>{product.dimensions}</span>
                    </div>
                  )}
                </div>
              </TabsContent>
              <TabsContent value="shipping" className="p-4">
                <p>Free shipping on all orders over $50. Standard delivery takes 3-5 business days.</p>
                <p className="mt-2">Express shipping options available at checkout.</p>
              </TabsContent>
            </Tabs>
          </Card>
        </div>
      </div>
    </div>
  )
}