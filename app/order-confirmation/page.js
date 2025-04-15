"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { CheckCircle, ChevronRight, Loader2, Clock } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { formatCurrency } from "@/lib/utils"

export default function OrderConfirmationPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [order, setOrder] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    async function fetchOrder() {
      try {
        const orderId = searchParams.get("orderId")
        if (!orderId) {
          setError("Order ID not found")
          setLoading(false)
          return
        }

        const response = await fetch(`/api/orders/${orderId}`)
        const data = await response.json()

        if (!response.ok) {
          throw new Error(data.error || "Failed to load order details")
        }

        setOrder(data.order)
      } catch (err) {
        console.error("Error fetching order:", err)
        setError(err.message || "Failed to load order details")
      } finally {
        setLoading(false)
      }
    }

    fetchOrder()
  }, [searchParams])

  if (loading) {
    return (
      <div className="h-screen flex flex-col items-center justify-center p-4">
        <Loader2 className="h-12 w-12 animate-spin text-gray-400 mb-4" />
        <h1 className="text-xl font-medium">Loading order details...</h1>
      </div>
    )
  }

  if (error || !order) {
    return (
      <div className="h-screen flex flex-col items-center justify-center p-4">
        <div className="text-center max-w-md">
          <h1 className="text-2xl font-bold text-gray-800 mb-4">Order Not Found</h1>
          <p className="text-gray-600 mb-6">{error || "We couldn't find your order details."}</p>
          <Button onClick={() => router.push("/")}>
            Return to Home
          </Button>
        </div>
      </div>
    )
  }

  const formatDate = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getStatusColor = (status) => {
    switch (status) {
      case "PENDING":
        return "bg-yellow-100 text-yellow-800"
      case "CONFIRMED":
        return "bg-blue-100 text-blue-800"
      case "DELIVERED":
        return "bg-green-100 text-green-800"
      case "DONE":
        return "bg-green-100 text-green-800"
      case "CANCELED":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const statusIcon = (status) => {
    switch (status) {
      case "PENDING":
        return <Clock className="h-5 w-5" />
      case "DELIVERED":
      case "DONE":
      case "CONFIRMED":
        return <CheckCircle className="h-5 w-5" />
      default:
        return null
    }
  }

  return (
    <div className="container mx-auto px-4 py-16">
      <Card className="max-w-4xl mx-auto p-6">
        <div className="text-center mb-8">
          <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
          <h1 className="text-3xl font-bold text-gray-800">Thank You for Your Order!</h1>
          <p className="text-gray-600 mt-2">
            Your order has been received and is now being processed.
          </p>
        </div>

        <div className="border rounded-lg p-4 mb-6">
          <div className="flex flex-col md:flex-row justify-between mb-4">
            <div>
              <h2 className="text-sm font-medium text-gray-500">Order Number</h2>
              <p className="font-medium">{order.id}</p>
            </div>
            <div>
              <h2 className="text-sm font-medium text-gray-500">Date</h2>
              <p>{formatDate(order.createdAt)}</p>
            </div>
            <div>
              <h2 className="text-sm font-medium text-gray-500">Total</h2>
              <p className="font-bold">{formatCurrency(order.totalAmount)}</p>
            </div>
            <div>
              <h2 className="text-sm font-medium text-gray-500">Status</h2>
              <div className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                {statusIcon(order.status)}
                <span className="ml-1">{order.status}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4">Order Details</h2>
          <div className="border rounded-lg overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Product
                  </th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Quantity
                  </th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Price
                  </th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Total
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {order.items.map((item) => (
                  <tr key={item.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{item.product.name}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-gray-500">
                      {item.quantity}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-gray-500">
                      {formatCurrency(item.price)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      {formatCurrency(item.price * item.quantity)}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot className="bg-gray-50">
                <tr>
                  <td colSpan="3" className="px-6 py-4 text-right text-sm font-medium text-gray-500">
                    Total
                  </td>
                  <td className="px-6 py-4 text-right text-sm font-bold">
                    {formatCurrency(order.totalAmount)}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>

        <div className="flex flex-col md:flex-row gap-6">
          <div className="flex-1">
            <h2 className="text-lg font-semibold mb-2">Shipping Information</h2>
            <p className="text-gray-600">{order.shippingAddress}</p>
          </div>
          <div className="flex-1">
            <h2 className="text-lg font-semibold mb-2">Payment Method</h2>
            <p className="text-gray-600">{order.paymentMethod}</p>
          </div>
        </div>
        
        <div className="mt-8 text-center">
          <Button
            onClick={() => router.push("/")}
            className="inline-flex items-center"
          >
            Continue Shopping
            <ChevronRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </Card>
    </div>
  )
}