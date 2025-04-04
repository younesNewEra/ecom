"use client"

import { useState } from "react"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { ChevronLeft, ChevronRight, Minus, Plus, ShoppingCart, Star } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default function ProductPage() {
  const router = useRouter()
  const [currentImage, setCurrentImage] = useState(0)
  const [quantity, setQuantity] = useState(1)
  const [selectedColor, setSelectedColor] = useState("Black")
  const [selectedSize, setSelectedSize] = useState("M")

  // Product data
  const product = {
    name: "Premium Wireless Headphones",
    price: 249.99,
    rating: 4.8,
    reviews: 124,
    description:
      "Experience crystal-clear sound with our premium wireless headphones. Featuring active noise cancellation, 30-hour battery life, and ultra-comfortable ear cushions for all-day listening.",
    features: [
      "Active Noise Cancellation",
      "30-hour battery life",
      "Bluetooth 5.2 connectivity",
      "Built-in microphone for calls",
      "Quick charge: 5 minutes for 3 hours of playback",
    ],
    specs: {
      "Driver Size": "40mm",
      "Frequency Response": "20Hz - 20kHz",
      Impedance: "32 Ohm",
      Weight: "250g",
      Charging: "USB-C",
    },
    images: [
      "/sliderBg2.jpg",
      "/sliderBg2.jpg",
      "/sliderBg2.jpg",
      "/sliderBg2.jpg",
    ],
    colors: ["Black", "White", "Navy Blue"],
    sizes: ["XS", "S", "M", "L", "XL", "XXL"],
  }

  // Carousel navigation
  const nextImage = () => {
    setCurrentImage((prev) => (prev + 1) % product.images.length)
  }

  const prevImage = () => {
    setCurrentImage((prev) => (prev - 1 + product.images.length) % product.images.length)
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

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl mt-18">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Product Images Carousel */}
        <div className="relative">
          <div className="relative aspect-square overflow-hidden rounded-lg bg-gray-100">
            <Image
              src={product.images[currentImage] || "/placeholder.svg"}
              alt={`${product.name} - Image ${currentImage + 1}`}
              fill
              className="object-cover"
              priority
            />

            {/* Carousel Navigation Buttons */}
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
          </div>

          {/* Thumbnail Navigation */}
          <div className="flex gap-2 mt-4 justify-center">
            {product.images.map((image, index) => (
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
        </div>

        {/* Product Details */}
        <div className="flex flex-col gap-6">
          <div>
            <h1 className="text-3xl font-bold">{product.name}</h1>
            <div className="flex items-center gap-2 mt-2">
              <div className="flex">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`h-5 w-5 ${
                      i < Math.floor(product.rating) ? "text-yellow-400 fill-yellow-400" : "text-gray-300"
                    }`}
                  />
                ))}
              </div>
              <span className="text-sm text-gray-600">
                {product.rating} ({product.reviews} reviews)
              </span>
            </div>
          </div>

          <div className="text-2xl font-bold">${product.price.toFixed(2)}</div>

          <p className="text-gray-700">{product.description}</p>

          {/* Color Selection */}
          <div>
            <h3 className="font-medium mb-2">Color</h3>
            <div className="flex gap-2">
              {product.colors.map((color) => (
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

          {/* Size Selection */}
          <div>
            <h3 className="font-medium mb-2">Size</h3>
            <div className="flex flex-wrap gap-2">
              {product.sizes.map((size) => (
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

          {/* Quantity Selector */}
          <div>
            <h3 className="font-medium mb-2">Quantity</h3>
            <div className="flex items-center border rounded-md w-fit">
              <button onClick={decreaseQuantity} className="px-3 py-2 hover:bg-gray-100" aria-label="Decrease quantity">
                <Minus className="h-4 w-4" />
              </button>
              <span className="px-4 py-2 border-x">{quantity}</span>
              <button onClick={increaseQuantity} className="px-3 py-2 hover:bg-gray-100" aria-label="Increase quantity">
                <Plus className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3">
            <Button className="flex-1 flex items-center gap-2" variant="outline">
              <ShoppingCart className="h-5 w-5" />
              Add to Cart
            </Button>
            <Button className="flex-1" onClick={handleBuyNow}>
              Buy Now
            </Button>
          </div>

          {/* Product Details Tabs */}
          <Card className="mt-6">
            <Tabs defaultValue="features">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="features">Features</TabsTrigger>
                <TabsTrigger value="specs">Specifications</TabsTrigger>
                <TabsTrigger value="shipping">Shipping</TabsTrigger>
              </TabsList>
              <TabsContent value="features" className="p-4">
                <ul className="list-disc pl-5 space-y-1">
                  {product.features.map((feature, index) => (
                    <li key={index}>{feature}</li>
                  ))}
                </ul>
              </TabsContent>
              <TabsContent value="specs" className="p-4">
                <div className="grid grid-cols-2 gap-2">
                  {Object.entries(product.specs).map(([key, value]) => (
                    <div key={key} className="flex justify-between">
                      <span className="font-medium">{key}:</span>
                      <span>{value}</span>
                    </div>
                  ))}
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

