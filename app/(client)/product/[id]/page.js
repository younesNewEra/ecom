"use client"

import { useState, useEffect, useMemo, useCallback } from "react"
import Image from "next/image"
import { useParams, useRouter } from "next/navigation"
import { ChevronLeft, ChevronRight, Minus, Plus, ShoppingCart, Star, Loader2, CheckCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { getProductById } from "@/lib/products-api"
import { formatCurrency } from "@/lib/utils"
import { addToCart } from "@/lib/cart"

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
  const [isAddingToCart, setIsAddingToCart] = useState(false)
  const [notification, setNotification] = useState({ show: false, message: "", type: "" })
  const [imagesLoaded, setImagesLoaded] = useState({})

  // Fetch product data
  useEffect(() => {
    // Tracking component mounted state to avoid state updates after unmount
    let isMounted = true;
    
    async function loadProduct() {
      try {
        setLoading(true)
        const productData = await getProductById(id)
        
        if (isMounted) {
          setProduct(productData)
          
          // Set default selected color and size if available
          if (productData.colors && productData.colors.length > 0) {
            setSelectedColor(productData.colors[0].color.name)
          }
          
          if (productData.sizes && productData.sizes.length > 0) {
            setSelectedSize(productData.sizes[0].size.name)
          }
          
          // Pre-mark the first image as loaded since it will be loaded with priority
          const productImages = getProductImages(productData);
          if (productImages.length > 0) {
            setImagesLoaded(prev => ({ ...prev, [productImages[0]]: true }));
          }
        }
      } catch (err) {
        console.error("Error loading product:", err)
        if (isMounted) {
          setError("Failed to load product details. Please try again later.")
        }
      } finally {
        if (isMounted) {
          setLoading(false)
        }
      }
    }
    
    if (id) {
      loadProduct()
    }
    
    return () => {
      isMounted = false;
    }
  }, [id])

  // Handle image load events
  const handleImageLoad = useCallback((imageSrc) => {
    setImagesLoaded(prev => ({ ...prev, [imageSrc]: true }));
  }, []);

  // Hide notification after a timeout
  useEffect(() => {
    let timeoutId;
    if (notification.show) {
      timeoutId = setTimeout(() => {
        setNotification({ show: false, message: "", type: "" });
      }, 3000);
    }
    return () => {
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [notification.show]);

  // Get product images with memoization to avoid recalculation
  const getProductImages = useCallback((productData) => {
    if (!productData) return ["/placeholder.svg"]
    
    // If product has multiple images stored in an 'images' array property
    if (productData.images && productData.images.length > 0) {
      return productData.images
    }
    
    // Otherwise just return the main product image
    return [productData.imageUrl]
  }, []);

  // Memoize the images array to avoid unnecessary recalculations
  const images = useMemo(() => product ? getProductImages(product) : ["/placeholder.svg"], [product, getProductImages]);

  // Handle image carousel
  const nextImage = useCallback(() => {
    if (images.length > 0) {
      setCurrentImage((prev) => (prev + 1) % images.length)
    }
  }, [images]);

  const prevImage = useCallback(() => {
    if (images.length > 0) {
      setCurrentImage((prev) => (prev - 1 + images.length) % images.length)
    }
  }, [images]);

  // Quantity controls
  const increaseQuantity = useCallback(() => {
    setQuantity((prev) => Math.min(prev + 1, product?.stock || Infinity))
  }, [product]);
  
  const decreaseQuantity = useCallback(() => {
    setQuantity((prev) => Math.max(1, prev - 1))
  }, []);

  // Find selected color and size IDs
  const getSelectedColorId = useCallback(() => {
    if (!product || !selectedColor) return null;
    const colorItem = product.colors.find(c => c.color.name === selectedColor);
    return colorItem ? colorItem.colorId : null;
  }, [product, selectedColor]);

  const getSelectedSizeId = useCallback(() => {
    if (!product || !selectedSize) return null;
    const sizeItem = product.sizes.find(s => s.size.name === selectedSize);
    return sizeItem ? sizeItem.sizeId : null;
  }, [product, selectedSize]);

  // Handle add to cart
  const handleAddToCart = async () => {
    try {
      setIsAddingToCart(true);
      
      const colorId = getSelectedColorId();
      const sizeId = getSelectedSizeId();
      
      await addToCart(product, quantity, colorId, sizeId);
      
      setNotification({
        show: true,
        message: `${quantity} x ${product.name} added to your cart`,
        type: "success"
      });
    } catch (error) {
      setNotification({
        show: true,
        message: error.message || "Failed to add item to cart",
        type: "error"
      });
    } finally {
      setIsAddingToCart(false);
    }
  };

  // Handle buy now
  const handleBuyNow = () => {
    // Navigate to checkout page with product details
    router.push(
      `/checkout?productId=${product.id}&colorId=${getSelectedColorId() || ''}&sizeId=${getSelectedSizeId() || ''}&quantity=${quantity}`,
    )
  }

  // Keyboard controls for image carousel
  useEffect(() => {
    const handleKeydown = (e) => {
      if (e.key === 'ArrowLeft') {
        prevImage();
      } else if (e.key === 'ArrowRight') {
        nextImage();
      }
    };
    
    window.addEventListener('keydown', handleKeydown);
    return () => window.removeEventListener('keydown', handleKeydown);
  }, [nextImage, prevImage]);

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

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl mt-16">
      {/* Notification */}
      {notification.show && (
        <div className={`fixed top-4 right-4 z-50 p-4 rounded-md shadow-md 
          ${notification.type === 'success' ? 'bg-green-100 border border-green-200' : 
          'bg-red-100 border border-red-200'} 
          max-w-md`}
        >
          <div className="flex items-center">
            {notification.type === 'success' ? (
              <CheckCircle className={`h-5 w-5 mr-2 text-green-500`} />
            ) : (
              <div className="h-5 w-5 mr-2 text-red-500">!</div>
            )}
            <span className={notification.type === 'success' ? 'text-green-800' : 'text-red-800'}>
              {notification.message}
            </span>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Product Images Carousel */}
        <div className="relative">
          <div className="relative aspect-square overflow-hidden rounded-lg bg-gray-100">
            {/* Main image with loading indicator */}
            <div className="relative w-full h-full">
              <Image
                src={images[currentImage] || "/placeholder.svg"}
                alt={`${product.name} - Image ${currentImage + 1}`}
                fill
                className={`object-cover transition-opacity duration-300 ${
                  imagesLoaded[images[currentImage]] ? 'opacity-100' : 'opacity-0'
                }`}
                priority={currentImage === 0}
                onLoad={() => handleImageLoad(images[currentImage])}
              />
              
              {/* Loading spinner */}
              {!imagesLoaded[images[currentImage]] && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
                </div>
              )}
            </div>

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
            <div className="flex gap-2 mt-4 overflow-x-auto pb-2 justify-center">
              {images.map((image, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentImage(index)}
                  className={`relative w-16 h-16 rounded-md overflow-hidden flex-shrink-0 ${
                    currentImage === index ? "ring-2 ring-black" : "opacity-70 hover:opacity-100"
                  }`}
                >
                  <Image 
                    src={image || "/placeholder.svg"} 
                    alt={`Thumbnail ${index + 1}`} 
                    fill 
                    className="object-cover"
                    loading="lazy"
                    sizes="64px"
                    onLoad={() => handleImageLoad(image)}
                  />
                  
                  {/* Loading spinner for thumbnails */}
                  {!imagesLoaded[image] && (
                    <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
                      <Loader2 className="h-4 w-4 animate-spin text-gray-400" />
                    </div>
                  )}
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
              <div className="flex flex-wrap gap-2">
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
                className="px-3 py-2 hover:bg-gray-100 disabled:opacity-50" 
                aria-label="Decrease quantity"
                disabled={product.stock <= 0}
              >
                <Minus className="h-4 w-4" />
              </button>
              <span className="px-4 py-2 border-x">{quantity}</span>
              <button 
                onClick={increaseQuantity} 
                className="px-3 py-2 hover:bg-gray-100 disabled:opacity-50" 
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
              disabled={product.stock <= 0 || isAddingToCart}
              onClick={handleAddToCart}
            >
              {isAddingToCart ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <ShoppingCart className="h-5 w-5" />
              )}
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