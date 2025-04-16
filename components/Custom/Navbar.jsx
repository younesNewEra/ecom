"use client"
import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { ShoppingCart, User, Menu, X, Search, Trash2, Plus, Minus, Loader2 } from "lucide-react"
import { getCartItems, updateCartItem, removeFromCart, invalidateCartCache } from "@/lib/cart"
import { formatCurrency } from "@/lib/utils"

export default function Navbar() {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const [cartOpen, setCartOpen] = useState(false)
  const pathname = usePathname()

  // Cart state
  const [cartItems, setCartItems] = useState([])
  const [isCartLoading, setIsCartLoading] = useState(false)
  const [isCartUpdating, setIsCartUpdating] = useState(false)

  // Load cart items from API with caching
  const fetchCartItems = async (forceRefresh = false) => {
    try {
      setIsCartLoading(true)
      const items = await getCartItems(forceRefresh)
      setCartItems(items)
    } catch (error) {
      console.error("Error fetching cart:", error)
    } finally {
      setIsCartLoading(false)
    }
  }

  // Fetch cart items when component mounts or cart is opened
  useEffect(() => {
    if (cartOpen) {
      fetchCartItems()
    }
  }, [cartOpen])

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 0)
    }
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  // Close mobile menu and cart when changing routes
  useEffect(() => {
    setIsOpen(false)
    setCartOpen(false)
  }, [pathname])

  // Prevent body scroll when cart or mobile menu is open
  useEffect(() => {
    if (cartOpen || isOpen) {
      document.body.style.overflow = "hidden"
    } else {
      document.body.style.overflow = "unset"
    }
    return () => {
      document.body.style.overflow = "unset"
    }
  }, [cartOpen, isOpen])

  // Cart functions with optimized response handling
  const updateQuantity = async (productId, quantity, colorId = null, sizeId = null) => {
    try {
      setIsCartUpdating(true)
      const response = await updateCartItem(productId, quantity, colorId, sizeId)
      
      // If the API returned updated items, use them directly instead of making another API call
      if (response.items) {
        setCartItems(response.items)
      } else {
        // Fall back to fetching updated cart if items not included in response
        await fetchCartItems(true)
      }
    } catch (error) {
      console.error("Error updating cart item:", error)
    } finally {
      setIsCartUpdating(false)
    }
  }

  const removeItem = async (productId, colorId = null, sizeId = null) => {
    try {
      setIsCartUpdating(true)
      const response = await removeFromCart(productId, colorId, sizeId)
      
      // If the API returned updated items, use them directly
      if (response.items) {
        setCartItems(response.items)
      } else {
        // Fall back to fetching updated cart if items not included in response
        await fetchCartItems(true)
      }
    } catch (error) {
      console.error("Error removing cart item:", error)
    } finally {
      setIsCartUpdating(false)
    }
  }

  const handleCheckout = () => {
    setCartOpen(false)
    // Invalidate cart cache before navigating to checkout
    invalidateCartCache()
    router.push('/checkout')
  }

  const itemCount = cartItems.reduce((count, item) => count + item.quantity, 0)
  const cartTotal = cartItems.reduce((total, item) => total + (item.product?.price || 0) * item.quantity, 0)
  const isProductPage = pathname.startsWith("/products") || pathname.startsWith("/product") || pathname.startsWith("/checkout");

  return (
    <>
      <nav
        className={`fixed top-0 left-0 w-full z-50 transition-all duration-300 ${
          isProductPage || scrolled ? "bg-white shadow-lg text-gray-900" : "bg-transparent text-white"
        }`}
      >
        <div className="container mx-auto px-4 flex items-center justify-between relative py-4">
          {/* Logo */}
          <Link href="/" className="text-2xl font-bold tracking-wide">
            Ecom
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {["Home", "Products"].map((item) => (
              <Link
                key={item}
                href={`/${item.toLowerCase()}`}
                className={`transition-colors ${
                  isProductPage || scrolled ? "text-gray-900 hover:text-gray-700" : "text-white hover:text-gray-300"
                }`}
              >
                {item}
              </Link>
            ))}
          </div>

          {/* Icons */}
          <div className="hidden md:flex items-center space-x-4">
            {/* Search Button */}
            <button
              onClick={() => setSearchOpen(!searchOpen)}
              className={`p-2 rounded-full transition-colors ${
                isProductPage || scrolled ? "hover:bg-gray-100 text-gray-900" : "hover:bg-white/10 text-white"
              }`}
              aria-label="Search"
            >
              <Search size={20} />
            </button>
            {/* Cart Button */}
            <button
              onClick={() => setCartOpen(true)}
              className={`relative p-2 rounded-full transition-colors ${
                isProductPage || scrolled ? "hover:bg-gray-100 text-gray-900" : "hover:bg-white/10 text-white"
              }`}
              aria-label="Cart"
            >
              <ShoppingCart size={20} />
              {itemCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs">
                  {itemCount}
                </span>
              )}
            </button>

            {/* Account Button */}
            <Link
              href="/account"
              className={`p-2 rounded-full transition-colors ${
                isProductPage || scrolled ? "hover:bg-gray-100 text-gray-900" : "hover:bg-white/10 text-white"
              }`}
              aria-label="Account"
            >
              <User size={20} />
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <div className="flex items-center space-x-2 md:hidden">
            {/* Mobile cart button */}
            <button
              onClick={() => setCartOpen(true)}
              className={`relative p-2 rounded-full transition-colors mr-2 ${
                isProductPage || scrolled ? "hover:bg-gray-100 text-gray-900" : "hover:bg-white/10 text-white"
              }`}
              aria-label="Cart"
            >
              <ShoppingCart size={20} />
              {itemCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs">
                  {itemCount}
                </span>
              )}
            </button>
            
            <button
              onClick={() => setIsOpen(!isOpen)}
              className={`p-2 focus:outline-none z-50 transition-colors ${
                isOpen || scrolled || isProductPage ? "text-gray-900" : "text-white"
              }`}
              aria-label={isOpen ? "Close menu" : "Open menu"}
            >
              {isOpen ? (
                <X size={24} className={isOpen || scrolled || isProductPage ? "text-gray-900" : "text-white"} />
              ) : (
                <Menu size={24} className={scrolled || isProductPage ? "text-gray-900" : "text-white"} />
              )}
            </button>
          </div>
        </div>

        {/* Search Bar */}
        {searchOpen && (
          <div className="absolute top-full left-0 w-full bg-white shadow-md">
            <div className="container mx-auto px-4 py-3">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search for products..."
                  className="w-full p-2 border rounded pl-10"
                />
                <Search size={18} className="absolute left-3 top-3 text-gray-400" />
              </div>
            </div>
          </div>
        )}

        {/* Mobile Navigation */}
        <div
          className={`fixed inset-0 bg-white z-40 pt-20 shadow-lg md:hidden flex flex-col items-start space-y-6 text-lg font-medium transition-transform duration-300 px-6 text-gray-900 ${
            isOpen ? "translate-x-0" : "translate-x-full"
          }`}
        >
          <div className="relative w-full">
            <input
              type="text"
              placeholder="Search for products..."
              className="w-full p-2 border border-gray-300 rounded pl-10"
            />
            <Search size={18} className="absolute left-3 top-3 text-gray-400" />
          </div>
          {["Products", "Categories", "Sale", "About"].map((item) => (
            <Link
              key={item}
              href={`/${item.toLowerCase()}`}
              className="text-gray-900 hover:text-gray-700 transition-colors"
            >
              {item}
            </Link>
          ))}
          <div className="flex space-x-4 mt-4">
            <Link href="/account" aria-label="Account" className="text-gray-900">
              <User size={24} />
            </Link>
          </div>
        </div>
      </nav>
      {/* Sliding Cart */}
      <div
        className={`fixed inset-y-0 right-0 z-50 bg-white shadow-xl transform transition-transform duration-300 ease-in-out ${
          cartOpen ? "translate-x-0" : "translate-x-full"
        } w-full md:w-1/2 h-screen flex flex-col`}
      >
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-xl font-bold">Your Cart ({itemCount} items)</h2>
          <button
            onClick={() => setCartOpen(false)}
            className="p-2 rounded-full hover:bg-gray-100"
            aria-label="Close cart"
          >
            <X size={24} />
          </button>
        </div>

        {isCartLoading ? (
          <div className="flex-1 flex items-center justify-center">
            <Loader2 className="h-10 w-10 animate-spin text-gray-400" />
            <span className="ml-2 text-gray-600">Loading your cart...</span>
          </div>
        ) : cartItems.length > 0 ? (
          <>
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {cartItems.map((item) => (
                <div 
                  key={`${item.productId}-${item.colorId || ''}-${item.sizeId || ''}`} 
                  className="flex items-center space-x-4 border-b pb-4"
                >
                  <div className="w-20 h-20 bg-gray-100 rounded overflow-hidden flex-shrink-0">
                    <img
                      src={item.product?.imageUrl || "/product-images/default-product.jpg"}
                      alt={item.product?.name}
                      className="w-full h-full object-cover"
                      width={80}
                      height={80}
                      loading="lazy"
                    />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-medium">{item.product?.name}</h3>
                    <p className="text-gray-600">{formatCurrency(item.product?.price || 0)}</p>
                    
                    {/* Display color and size if applicable */}
                    {(item.color || item.size) && (
                      <div className="text-sm text-gray-500 mt-1">
                        {item.color && <span>Color: {item.color.name}</span>}
                        {item.color && item.size && <span> | </span>}
                        {item.size && <span>Size: {item.size.name}</span>}
                      </div>
                    )}
                    
                    <div className="flex items-center mt-2">
                      <button
                        onClick={() => updateQuantity(item.productId, Math.max(1, item.quantity - 1), item.colorId, item.sizeId)}
                        className="p-1 rounded-full hover:bg-gray-100 disabled:opacity-50"
                        aria-label="Decrease quantity"
                        disabled={isCartUpdating}
                      >
                        <Minus size={16} />
                      </button>
                      <span className="mx-2">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item.productId, item.quantity + 1, item.colorId, item.sizeId)}
                        className="p-1 rounded-full hover:bg-gray-100 disabled:opacity-50"
                        aria-label="Increase quantity"
                        disabled={isCartUpdating}
                      >
                        <Plus size={16} />
                      </button>
                    </div>
                  </div>
                  <button
                    onClick={() => removeItem(item.productId, item.colorId, item.sizeId)}
                    className="p-2 text-gray-500 hover:text-red-500 disabled:opacity-50"
                    aria-label="Remove item"
                    disabled={isCartUpdating}
                  >
                    <Trash2 size={20} />
                  </button>
                </div>
              ))}
            </div>

            <div className="border-t p-4 space-y-4">
              <div className="flex justify-between text-lg font-semibold">
                <span>Subtotal:</span>
                <span>{formatCurrency(cartTotal)}</span>
              </div>
              <p className="text-sm text-gray-500">Shipping and taxes calculated at checkout</p>
              <button 
                className="w-full bg-black text-white py-3 rounded-md hover:bg-gray-800 transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
                onClick={handleCheckout}
                disabled={isCartUpdating || cartItems.length === 0}
              >
                {isCartUpdating ? (
                  <>
                    <Loader2 className="inline-block mr-2 h-4 w-4 animate-spin" />
                    Updating...
                  </>
                ) : (
                  "Checkout"
                )}
              </button>
              <button
                onClick={() => setCartOpen(false)}
                className="w-full border border-gray-300 py-3 rounded-md hover:bg-gray-50 transition-colors"
              >
                Continue Shopping
              </button>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center p-4">
            <ShoppingCart size={64} className="text-gray-300 mb-4" />
            <h3 className="text-xl font-medium mb-2">Your cart is empty</h3>
            <p className="text-gray-500 mb-6 text-center">
              Looks like you haven't added any products to your cart yet.
            </p>
            <button
              onClick={() => setCartOpen(false)}
              className="bg-black text-white px-6 py-3 rounded-md hover:bg-gray-800 transition-colors"
            >
              Continue Shopping
            </button>
          </div>
        )}
      </div>

      {/* Overlay for cart */}
      {cartOpen && <div className="fixed inset-0 bg-gray-700/30 backdrop-blur-lg z-40" onClick={() => setCartOpen(false)}></div>}
    </>
  )
}

