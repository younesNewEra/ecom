"use client"
import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { ShoppingCart, User, Menu, X, Search, Trash2, Plus, Minus } from "lucide-react"

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const [cartOpen, setCartOpen] = useState(false)
  const pathname = usePathname()

  // Sample cart items
  const [cartItems, setCartItems] = useState([
    { id: 1, name: "Premium T-Shirt", price: 29.99, quantity: 1, image: "/placeholder.svg" },
    { id: 2, name: "Designer Jeans", price: 89.99, quantity: 1, image: "/placeholder.svg" },
    { id: 3, name: "Casual Sneakers", price: 59.99, quantity: 1, image: "/placeholder.svg" },
  ])

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

  // Cart functions
  const updateQuantity = (id, change) => {
    setCartItems(
      cartItems.map((item) => (item.id === id ? { ...item, quantity: Math.max(1, item.quantity + change) } : item)),
    )
  }

  const removeItem = (id) => {
    setCartItems(cartItems.filter((item) => item.id !== id))
  }

  const cartTotal = cartItems.reduce((total, item) => total + item.price * item.quantity, 0)
  const itemCount = cartItems.reduce((count, item) => count + item.quantity, 0)

  return (
    <>
      <nav
        className={`fixed top-0 left-0 w-full z-50 transition-all duration-300 ${scrolled ? "bg-white shadow-lg py-4" : "bg-transparent py-4"}`}
      >
        <div className="container mx-auto px-4 flex items-center justify-between relative">
          {/* Logo */}
          <Link
            href="/"
            className={`text-2xl font-bold tracking-wide transition-colors ${scrolled ? "text-gray-900" : "text-white"}`}
          >
            Ecom
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {["Products", "Categories", "Sale"].map((item) => (
              <Link
                key={item}
                href={`/${item.toLowerCase()}`}
                className={`transition-colors ${scrolled ? "text-gray-900 hover:text-gray-700" : "text-white hover:text-gray-300"}`}
              >
                {item}
              </Link>
            ))}
          </div>

          {/* Icons */}
          <div className="hidden md:flex items-center space-x-4">
            <button
              onClick={() => setSearchOpen(!searchOpen)}
              className={`p-2 rounded-full transition-colors ${scrolled ? "hover:bg-gray-100 text-gray-900" : "hover:bg-white/10 text-white"}`}
              aria-label="Search"
            >
              <Search size={20} />
            </button>
            <button
              onClick={() => setCartOpen(true)}
              className={`relative p-2 rounded-full transition-colors ${scrolled ? "hover:bg-gray-100 text-gray-900" : "hover:bg-white/10 text-white"}`}
              aria-label="Cart"
            >
              <ShoppingCart size={20} />
              <span className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs">
                {itemCount}
              </span>
            </button>
            <Link
              href="/account"
              className={`p-2 rounded-full transition-colors ${scrolled ? "hover:bg-gray-100 text-gray-900" : "hover:bg-white/10 text-white"}`}
              aria-label="Account"
            >
              <User size={20} />
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <div className="flex items-center space-x-2 md:hidden">
            <button
              onClick={() => setCartOpen(true)}
              className={`relative p-2 rounded-full transition-colors ${scrolled ? "hover:bg-gray-100 text-gray-900" : "hover:bg-white/10 text-white"}`}
              aria-label="Cart"
            >
              <ShoppingCart size={20} />
              <span className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs">
                {itemCount}
              </span>
            </button>
            <button
              onClick={() => setIsOpen(!isOpen)}
              className={`p-2 focus:outline-none z-50 transition-colors ${scrolled ? "text-gray-900" : "text-white"}`}
              aria-label={isOpen ? "Close menu" : "Open menu"}
            >
              {isOpen ? (
                <X size={24} className="text-gray-900" />
              ) : (
                <Menu size={24} className={scrolled ? "text-gray-900" : "text-white"} />
              )}
            </button>
          </div>
        </div>

        {/* Search Bar */}
        {searchOpen && (
          <div className="mt-4 container mx-auto px-4">
            <div className="relative">
              <input type="text" placeholder="Search for products..." className="w-full p-2 border rounded pl-10" />
              <Search size={18} className="absolute left-3 top-3 text-gray-400" />
            </div>
          </div>
        )}

        {/* Mobile Navigation - Always white bg with dark text */}
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

        {cartItems.length > 0 ? (
          <>
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {cartItems.map((item) => (
                <div key={item.id} className="flex items-center space-x-4 border-b pb-4">
                  <div className="w-20 h-20 bg-gray-100 rounded overflow-hidden flex-shrink-0">
                    <img
                      src={item.image || "/placeholder.svg"}
                      alt={item.name}
                      className="w-full h-full object-cover"
                      width={80}
                      height={80}
                    />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-medium">{item.name}</h3>
                    <p className="text-gray-600">${item.price.toFixed(2)}</p>
                    <div className="flex items-center mt-2">
                      <button
                        onClick={() => updateQuantity(item.id, -1)}
                        className="p-1 rounded-full hover:bg-gray-100"
                        aria-label="Decrease quantity"
                      >
                        <Minus size={16} />
                      </button>
                      <span className="mx-2">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item.id, 1)}
                        className="p-1 rounded-full hover:bg-gray-100"
                        aria-label="Increase quantity"
                      >
                        <Plus size={16} />
                      </button>
                    </div>
                  </div>
                  <button
                    onClick={() => removeItem(item.id)}
                    className="p-2 text-gray-500 hover:text-red-500"
                    aria-label="Remove item"
                  >
                    <Trash2 size={20} />
                  </button>
                </div>
              ))}
            </div>

            <div className="border-t p-4 space-y-4">
              <div className="flex justify-between text-lg font-semibold">
                <span>Subtotal:</span>
                <span>${cartTotal.toFixed(2)}</span>
              </div>
              <p className="text-sm text-gray-500">Shipping and taxes calculated at checkout</p>
              <button className="w-full bg-black text-white py-3 rounded-md hover:bg-gray-800 transition-colors">
                Checkout
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

