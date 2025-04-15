"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import { useRouter, useSearchParams } from "next/navigation"
import { Check, Loader2, CheckCircle, AlertCircle } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { getCartItems, createOrder, buyNow } from "@/lib/cart"
import { getProductById } from "@/lib/products-api"
import { formatCurrency } from "@/lib/utils"
import statesData from "@/data/statesData"

export default function CheckoutPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  
  // State for customer information
  const [fullName, setFullName] = useState("")
  const [phone, setPhone] = useState("")
  const [state, setState] = useState("")
  const [commune, setCommune] = useState("")
  
  // State for order information
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [isProcessing, setIsProcessing] = useState(false)
  
  // State for direct buy
  const [directBuyProduct, setDirectBuyProduct] = useState(null)
  const [directBuyQuantity, setDirectBuyQuantity] = useState(0)
  const [directBuyColorId, setDirectBuyColorId] = useState(null)
  const [directBuySizeId, setDirectBuySizeId] = useState(null)
  
  // State for available communes based on selected state
  const [availableCommunes, setAvailableCommunes] = useState([])
  
  // State for notification
  const [notification, setNotification] = useState({ show: false, message: "", type: "" })
  
  // Calculate order summary
  const subtotal = items.reduce((total, item) => {
    return total + (item.product?.price || item.price) * item.quantity
  }, directBuyProduct ? directBuyProduct.price * directBuyQuantity : 0)
  
  const shipping = subtotal > 0 ? 15.0 : 0
  const total = subtotal + shipping

  // Load cart items or direct buy product on mount
  useEffect(() => {
    async function loadCheckoutData() {
      try {
        setLoading(true)
        
        // Check if we have direct buy parameters
        const productId = searchParams.get("productId")
        const quantity = searchParams.get("quantity")
        
        if (productId && quantity) {
          // This is a direct buy
          const product = await getProductById(productId)
          setDirectBuyProduct(product)
          setDirectBuyQuantity(parseInt(quantity))
          setDirectBuyColorId(searchParams.get("colorId") || null)
          setDirectBuySizeId(searchParams.get("sizeId") || null)
        } else {
          // Load items from cart
          const cartItems = await getCartItems()
          setItems(cartItems)
        }
      } catch (err) {
        console.error("Error loading checkout data:", err)
        setError("Failed to load checkout data. Please try again.")
      } finally {
        setLoading(false)
      }
    }
    
    loadCheckoutData()
  }, [searchParams])

  // Update available communes when state changes
  useEffect(() => {
    if (state) {
      const selectedState = statesData[state]
      if (selectedState && selectedState.baladiyas) {
        setAvailableCommunes(selectedState.baladiyas)
        setCommune("") // Reset commune when state changes
      } else {
        setAvailableCommunes([])
      }
    } else {
      setAvailableCommunes([])
    }
  }, [state])

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

  // Handle checkout form submission
  const handleCheckout = async () => {
    try {
      // Validate form - only require fullName and phone
      if (!fullName || !phone) {
        setNotification({
          show: true,
          message: "Please fill out all required fields",
          type: "error"
        });
        return;
      }
      
      // Validate that we have items to checkout
      if (!directBuyProduct && items.length === 0) {
        setNotification({
          show: true,
          message: "Your cart is empty. Add items before checking out.",
          type: "error"
        });
        return;
      }
      
      setIsProcessing(true)
      
      // Prepare shipping address - use entered data or default
      const shippingAddress = state && commune ? 
        `${commune}, ${statesData[state].wilaya_fr}` : 
        "Not specified";
      
      // Prepare customer info
      const customerInfo = {
        name: fullName,
        phone,
      }
      
      let orderResult
      
      if (directBuyProduct) {
        // Direct buy checkout
        orderResult = await buyNow(
          directBuyProduct,
          directBuyQuantity,
          directBuyColorId,
          directBuySizeId,
          {
            shippingAddress,
            customerInfo,
          }
        )
      } else {
        // Cart checkout
        orderResult = await createOrder({
          shippingAddress,
          customerInfo,
        })
      }
      
      // Show success message
      setNotification({
        show: true,
        message: `Order #${orderResult.order.id.substring(0, 8)} has been created successfully!`,
        type: "success"
      });
      
      // Brief delay before redirect to show the success message
      setTimeout(() => {
        // Redirect to a thank you page or back to home
        router.push(`/order-confirmation?orderId=${orderResult.order.id}`);
      }, 1000);
      
    } catch (error) {
      console.error("Error during checkout:", error);
      setNotification({
        show: true,
        message: error.message || "There was an error processing your order. Please try again.",
        type: "error"
      });
      setIsProcessing(false);
    }
  }

  if (loading) {
    return (
      <div className="h-[100vh] min-h-screen bg-white pt-16 flex items-center justify-center">
        <div className="flex flex-col items-center">
          <Loader2 className="h-12 w-12 animate-spin text-gray-400" />
          <p className="mt-4 text-gray-600">Loading checkout information...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="h-[100vh] min-h-screen bg-white pt-16 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-700 mb-4">Error</h2>
          <p className="text-gray-600 mb-8">{error}</p>
          <Button onClick={() => router.push('/')}>
            Return to Home
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="h-[100vh] min-h-screen bg-white pt-16">
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
              <AlertCircle className="h-5 w-5 mr-2 text-red-500" />
            )}
            <span className={notification.type === 'success' ? 'text-green-800' : 'text-red-800'}>
              {notification.message}
            </span>
          </div>
        </div>
      )}

      <div className="container mx-auto py-6 px-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Column - Customer Information */}
          <div>
            <h2 className="text-xl font-bold mb-6">Checkout</h2>
            <div className="space-y-4">
              <div>
                <Label htmlFor="fullName" className="text-sm text-gray-500 mb-1 block">
                  Full name *
                </Label>
                <Input
                  id="fullName"
                  placeholder="Enter full name"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="border border-gray-200 rounded-md h-10 focus:border-black focus:ring-0"
                />
              </div>

              <div>
                <Label htmlFor="phone" className="text-sm text-gray-500 mb-1 block">
                  Phone number *
                </Label>
                <Input
                  id="phone"
                  placeholder="Enter phone number"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="border border-gray-200 rounded-md h-10 focus:border-black focus:ring-0"
                />
              </div>

              <div>
                <Label htmlFor="state" className="text-sm text-gray-500 mb-1 block">
                  Wilaya
                </Label>
                <select
                  id="state"
                  value={state}
                  onChange={(e) => setState(e.target.value)}
                  className="w-full border border-gray-200 rounded-md h-10 px-3 focus:border-black focus:ring-0"
                >
                  <option value="">Select Wilaya</option>
                  {Object.keys(statesData).map((code) => (
                    <option key={code} value={code}>
                      {statesData[code].wilaya_fr}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <Label htmlFor="commune" className="text-sm text-gray-500 mb-1 block">
                  Commune
                </Label>
                <select
                  id="commune"
                  value={commune}
                  onChange={(e) => setCommune(e.target.value)}
                  className="w-full border border-gray-200 rounded-md h-10 px-3 focus:border-black focus:ring-0"
                  disabled={!state}
                >
                  <option value="">Select Commune</option>
                  {availableCommunes.map((baladia) => (
                    <option key={baladia} value={baladia}>
                      {baladia}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <p className="text-xs text-gray-500 mt-4">* Items marked with an asterisk are required</p>
          </div>

          {/* Right Column - Order Summary */}
          <div className="bg-gray-50 p-6 rounded-lg">
            <h2 className="text-lg font-medium mb-4">Review your order</h2>

            <div className="space-y-4 mb-6">
              {directBuyProduct ? (
                <div className="flex gap-3">
                  <div className="w-16 h-16 bg-gray-100 rounded-md overflow-hidden relative flex-shrink-0">
                    <Image
                      src={directBuyProduct.imageUrl || "/product-images/default-product.jpg"}
                      alt={directBuyProduct.name}
                      width={64}
                      height={64}
                      className="object-cover"
                    />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-sm font-medium">{directBuyProduct.name}</h3>
                    <p className="text-sm text-gray-500">
                      Qty: {directBuyQuantity}
                    </p>
                    <p className="text-sm font-medium mt-1">
                      {formatCurrency(directBuyProduct.price * directBuyQuantity)}
                    </p>
                  </div>
                </div>
              ) : (
                items.map((item) => (
                  <div key={`${item.productId}-${item.colorId || ''}-${item.sizeId || ''}`} className="flex gap-3">
                    <div className="w-16 h-16 bg-gray-100 rounded-md overflow-hidden relative flex-shrink-0">
                      <Image
                        src={item.product?.imageUrl || "/product-images/default-product.jpg"}
                        alt={item.product?.name}
                        width={64}
                        height={64}
                        className="object-cover"
                      />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-sm font-medium">{item.product?.name}</h3>
                      <p className="text-sm text-gray-500">
                        Qty: {item.quantity}
                      </p>
                      <p className="text-sm font-medium mt-1">
                        {formatCurrency((item.product?.price || item.price) * item.quantity)}
                      </p>
                    </div>
                  </div>
                ))
              )}

              {items.length === 0 && !directBuyProduct && (
                <div className="text-center py-6">
                  <p className="text-gray-500">Your cart is empty</p>
                </div>
              )}
            </div>

            <Separator className="my-4 bg-gray-200" />

            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">Subtotal</span>
                <span>{formatCurrency(subtotal)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Shipping</span>
                <span>{formatCurrency(shipping)}</span>
              </div>
            </div>

            <Separator className="my-4 bg-gray-200" />

            <div className="flex justify-between font-medium mb-6">
              <span>Total</span>
              <span>{formatCurrency(total)}</span>
            </div>

            <Button 
              className="w-full bg-black hover:bg-gray-800 text-white h-12"
              onClick={handleCheckout}
              disabled={isProcessing || items.length === 0 && !directBuyProduct}
            >
              {isProcessing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : (
                "Complete Order"
              )}
            </Button>

            <div className="flex items-center gap-2 mt-4 justify-center">
              <Check className="h-4 w-4 text-gray-400" />
              <span className="text-xs text-gray-500">Secure Checkout • SSL Encrypted</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
