"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { format } from "date-fns"
import { AlertCircle, CalendarIcon, ChevronDown, ChevronUp, Loader2, CheckCircle, Phone } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { formatCurrency } from "@/lib/utils"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"

export default function OrdersPage() {
  const [date, setDate] = useState(null)
  const [statusFilter, setStatusFilter] = useState("all")
  const [sortDirection, setSortDirection] = useState("desc")
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [notification, setNotification] = useState({ show: false, message: "", type: "" })
  const [selectedOrder, setSelectedOrder] = useState(null)
  const [orderDetailsOpen, setOrderDetailsOpen] = useState(false)

  useEffect(() => {
    async function loadOrders() {
      try {
        setLoading(true)
        const response = await fetch('/api/orders')
        const data = await response.json()
        
        if (!response.ok) {
          throw new Error(data.error || 'Failed to load orders')
        }
        
        setOrders(data.orders)
      } catch (err) {
        console.error('Error loading orders:', err)
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }
    
    loadOrders()
  }, [])

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

  // Update order status
  const updateOrderStatus = async (orderId, newStatus) => {
    try {
      const response = await fetch(`/api/orders/${orderId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
      })
      
      const data = await response.json()
      
      if (!response.ok) {
        throw new Error(data.error || `Failed to update order status`)
      }
      
      // Update orders in state
      setOrders(orders.map(order => 
        order.id === orderId ? { ...order, status: newStatus } : order
      ))
      
      setNotification({
        show: true,
        message: `Order #${orderId.substring(0, 8)} status changed to ${newStatus}`,
        type: "success"
      });
    } catch (error) {
      console.error('Error updating order status:', error)
      setNotification({
        show: true,
        message: error.message || "Failed to update order status",
        type: "error"
      });
    }
  }

  // Function to extract phone number from shipping address
  const extractPhoneNumber = (shippingAddress) => {
    if (!shippingAddress) return "N/A";
    
    // Try to extract phone number using regex pattern
    const phoneMatch = shippingAddress.match(/Phone:\s*([0-9+\-\s()]+)(?:,|$)/);
    if (phoneMatch && phoneMatch[1]) {
      return phoneMatch[1].trim();
    }
    
    return "N/A";
  }
  
  // Function to open order details dialog
  const handleOpenOrderDetails = (order) => {
    setSelectedOrder(order);
    setOrderDetailsOpen(true);
  }

  // Filter and sort orders
  const filteredOrders = orders
    .filter((order) => {
      // Status filter
      if (statusFilter !== "all" && order.status !== statusFilter) {
        return false
      }
      
      // Date filter
      if (date) {
        const orderDate = new Date(order.createdAt)
        const filterDate = new Date(date)
        
        // Compare year, month, and day
        return (
          orderDate.getFullYear() === filterDate.getFullYear() &&
          orderDate.getMonth() === filterDate.getMonth() &&
          orderDate.getDate() === filterDate.getDate()
        )
      }
      
      return true
    })
    .sort((a, b) => {
      const dateA = new Date(a.createdAt)
      const dateB = new Date(b.createdAt)
      return sortDirection === "asc" ? dateA - dateB : dateB - dateA
    })

  const toggleSortDirection = () => {
    setSortDirection(sortDirection === "asc" ? "desc" : "asc")
  }

  const getStatusColor = (status) => {
    switch (status) {
      case "DELIVERED":
      case "DONE":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
      case "CONFIRMED":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300"
      case "PENDING":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300"
      case "CANCELED":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300"
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300"
    }
  }

  const formatDate = (dateString) => {
    const date = new Date(dateString)
    return format(date, 'MMM dd, yyyy')
  }

  if (loading) {
    return (
      <div className="flex-1 space-y-4 p-4 md:p-8 pt-6 flex items-center justify-center">
        <div className="flex flex-col items-center">
          <Loader2 className="h-12 w-12 animate-spin text-gray-400" />
          <p className="mt-4 text-gray-600">Loading orders...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex-1 space-y-4 p-4 md:p-8 pt-6 flex items-center justify-center">
        <div className="text-center max-w-md">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Something went wrong</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <Button onClick={() => window.location.reload()}>
            Try Again
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
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

      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Orders</h2>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Order List</CardTitle>
          <CardDescription>View and manage all customer orders.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="flex-1">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="PENDING">Pending</SelectItem>
                  <SelectItem value="CONFIRMED">Confirmed</SelectItem>
                  <SelectItem value="DELIVERED">Delivered</SelectItem>
                  <SelectItem value="DONE">Done</SelectItem>
                  <SelectItem value="CANCELED">Canceled</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex-1">
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-full justify-start text-left font-normal">
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {date ? format(date, "PPP") : "Filter by date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar mode="single" selected={date} onSelect={setDate} initialFocus />
                </PopoverContent>
              </Popover>
            </div>

            <div className="flex-none">
              <Button
                variant="outline"
                onClick={() => {
                  setStatusFilter("all")
                  setDate(null)
                }}
              >
                Clear Filters
              </Button>
            </div>
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead><div className="flex items-center"><Phone className="mr-2 h-4 w-4" />Phone Number</div></TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="cursor-pointer" onClick={toggleSortDirection}>
                  <div className="flex items-center">
                    Date
                    {sortDirection === "asc" ? (
                      <ChevronUp className="ml-1 h-4 w-4" />
                    ) : (
                      <ChevronDown className="ml-1 h-4 w-4" />
                    )}
                  </div>
                </TableHead>
                <TableHead className="text-right">Total Amount</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredOrders.map((order) => (
                <TableRow 
                  key={order.id} 
                  className="cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800"
                  onClick={() => handleOpenOrderDetails(order)}
                >
                  <TableCell className="font-medium">{extractPhoneNumber(order.shippingAddress)}</TableCell>
                  <TableCell>{order.user.name}</TableCell>
                  <TableCell>
                    <Badge className={getStatusColor(order.status)}>{order.status}</Badge>
                  </TableCell>
                  <TableCell>{formatDate(order.createdAt)}</TableCell>
                  <TableCell className="text-right">{formatCurrency(order.totalAmount)}</TableCell>
                  <TableCell className="text-right" onClick={(e) => e.stopPropagation()}>
                    <Select
                      value={order.status}
                      onValueChange={(value) => updateOrderStatus(order.id, value)}
                    >
                      <SelectTrigger className="w-[130px]">
                        <SelectValue placeholder="Update status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="PENDING">Pending</SelectItem>
                        <SelectItem value="CONFIRMED">Confirmed</SelectItem>
                        <SelectItem value="DELIVERED">Delivered</SelectItem>
                        <SelectItem value="DONE">Done</SelectItem>
                        <SelectItem value="CANCELED">Canceled</SelectItem>
                      </SelectContent>
                    </Select>
                  </TableCell>
                </TableRow>
              ))}
              {filteredOrders.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-4">
                    No orders found matching the current filters.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Order Details Dialog */}
      <Dialog open={orderDetailsOpen} onOpenChange={setOrderDetailsOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Order Details</DialogTitle>
            <DialogDescription>
              Order #{selectedOrder?.id?.substring(0, 8)} - {selectedOrder?.status}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 max-h-96 overflow-y-auto pr-2">
            {/* Customer Info */}
            <div className="border rounded-md p-4">
              <h3 className="font-medium text-gray-900 dark:text-gray-100 mb-2">Customer Information</h3>
              <p><span className="font-medium">Name:</span> {selectedOrder?.user?.name}</p>
              <p><span className="font-medium">Email:</span> {selectedOrder?.user?.email}</p>
              <p><span className="font-medium">Phone:</span> {extractPhoneNumber(selectedOrder?.shippingAddress)}</p>
              <p><span className="font-medium">Address:</span> {selectedOrder?.shippingAddress?.replace(/Phone:.*?,\s*Address:\s*/i, '')}</p>
              <p><span className="font-medium">Payment Method:</span> {selectedOrder?.paymentMethod}</p>
            </div>
            
            {/* Products List */}
            <div className="border rounded-md p-4">
              <h3 className="font-medium text-gray-900 dark:text-gray-100 mb-2">Order Items</h3>
              <div className="divide-y">
                {selectedOrder?.items?.map((item) => (
                  <div key={item.id} className="py-3">
                    <div className="flex items-start">
                      <div className="w-16 h-16 flex-shrink-0 rounded-md overflow-hidden bg-gray-100 mr-4">
                        <img 
                          src={item.product?.imageUrl || '/product-images/default-product.jpg'} 
                          alt={item.product?.name} 
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-gray-900 dark:text-gray-100">{item.product?.name}</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                          Quantity: {item.quantity} × {formatCurrency(item.price)}
                        </p>
                        {item.sizeId && <p className="text-sm text-gray-500">Size: {item.sizeId}</p>}
                        {item.colorId && <p className="text-sm text-gray-500">Color: {item.colorId}</p>}
                      </div>
                      <div className="text-right">
                        <p className="font-medium text-gray-900 dark:text-gray-100">
                          {formatCurrency(item.price * item.quantity)}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              
              {/* Order Summary */}
              <div className="mt-4 pt-4 border-t">
                <div className="flex justify-between">
                  <span className="font-medium">Total</span>
                  <span className="font-bold">{formatCurrency(selectedOrder?.totalAmount)}</span>
                </div>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

