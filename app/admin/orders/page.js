"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { format } from "date-fns"
import { CalendarIcon, ChevronDown, ChevronUp } from "lucide-react"
import { Badge } from "@/components/ui/badge"

export default function OrdersPage() {
  const [date, setDate] = useState(null)
  const [statusFilter, setStatusFilter] = useState("all")
  const [sortDirection, setSortDirection] = useState("desc")

  // Sample data
  const orders = [
    {
      id: "ORD-001",
      customer: "John Smith",
      status: "Delivered",
      date: "2023-04-15",
      total: 124.99,
    },
    {
      id: "ORD-002",
      customer: "Sarah Johnson",
      status: "Sold",
      date: "2023-04-16",
      total: 89.5,
    },
    {
      id: "ORD-003",
      customer: "Michael Brown",
      status: "Canceled",
      date: "2023-04-14",
      total: 210.75,
    },
    {
      id: "ORD-004",
      customer: "Emily Davis",
      status: "Delivered",
      date: "2023-04-17",
      total: 45.25,
    },
    {
      id: "ORD-005",
      customer: "Robert Wilson",
      status: "Sold",
      date: "2023-04-18",
      total: 175.0,
    },
  ]

  // Filter and sort orders
  const filteredOrders = orders
    .filter((order) => statusFilter === "all" || order.status === statusFilter)
    .sort((a, b) => {
      const dateA = new Date(a.date)
      const dateB = new Date(b.date)
      return sortDirection === "asc" ? dateA - dateB : dateB - dateA
    })

  const toggleSortDirection = () => {
    setSortDirection(sortDirection === "asc" ? "desc" : "asc")
  }

  const getStatusColor = (status) => {
    switch (status) {
      case "Delivered":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
      case "Sold":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300"
      case "Canceled":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300"
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300"
    }
  }

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
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
                  <SelectItem value="Delivered">Delivered</SelectItem>
                  <SelectItem value="Sold">Sold</SelectItem>
                  <SelectItem value="Canceled">Canceled</SelectItem>
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
                <TableHead>Order ID</TableHead>
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
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredOrders.map((order) => (
                <TableRow key={order.id}>
                  <TableCell className="font-medium">{order.id}</TableCell>
                  <TableCell>{order.customer}</TableCell>
                  <TableCell>
                    <Badge className={getStatusColor(order.status)}>{order.status}</Badge>
                  </TableCell>
                  <TableCell>{order.date}</TableCell>
                  <TableCell className="text-right">${order.total.toFixed(2)}</TableCell>
                </TableRow>
              ))}
              {filteredOrders.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-4">
                    No orders found matching the current filters.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}

