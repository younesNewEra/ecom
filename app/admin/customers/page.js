"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Search } from "lucide-react"

export default function CustomersPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCustomer, setSelectedCustomer] = useState(null)

  // Sample data
  const customers = [
    {
      id: 1,
      name: "John Smith",
      email: "john.smith@example.com",
      totalOrders: 5,
      lastOrderDate: "2023-04-15",
      orderHistory: [
        { id: "ORD-001", date: "2023-04-15", total: 124.99, status: "Delivered" },
        { id: "ORD-008", date: "2023-03-22", total: 89.5, status: "Delivered" },
        { id: "ORD-015", date: "2023-02-10", total: 45.25, status: "Delivered" },
        { id: "ORD-023", date: "2023-01-05", total: 210.75, status: "Delivered" },
        { id: "ORD-031", date: "2022-12-18", total: 75.0, status: "Delivered" },
      ],
    },
    {
      id: 2,
      name: "Sarah Johnson",
      email: "sarah.johnson@example.com",
      totalOrders: 3,
      lastOrderDate: "2023-04-16",
      orderHistory: [
        { id: "ORD-002", date: "2023-04-16", total: 89.5, status: "Sold" },
        { id: "ORD-012", date: "2023-03-01", total: 145.75, status: "Delivered" },
        { id: "ORD-024", date: "2023-01-12", total: 67.25, status: "Delivered" },
      ],
    },
    {
      id: 3,
      name: "Michael Brown",
      email: "michael.brown@example.com",
      totalOrders: 2,
      lastOrderDate: "2023-04-14",
      orderHistory: [
        { id: "ORD-003", date: "2023-04-14", total: 210.75, status: "Canceled" },
        { id: "ORD-018", date: "2023-02-28", total: 150.0, status: "Delivered" },
      ],
    },
    {
      id: 4,
      name: "Emily Davis",
      email: "emily.davis@example.com",
      totalOrders: 4,
      lastOrderDate: "2023-04-17",
      orderHistory: [
        { id: "ORD-004", date: "2023-04-17", total: 45.25, status: "Delivered" },
        { id: "ORD-011", date: "2023-03-05", total: 120.5, status: "Delivered" },
        { id: "ORD-019", date: "2023-02-15", total: 85.75, status: "Delivered" },
        { id: "ORD-027", date: "2023-01-20", total: 35.99, status: "Canceled" },
      ],
    },
    {
      id: 5,
      name: "Robert Wilson",
      email: "robert.wilson@example.com",
      totalOrders: 1,
      lastOrderDate: "2023-04-18",
      orderHistory: [{ id: "ORD-005", date: "2023-04-18", total: 175.0, status: "Sold" }],
    },
  ]

  // Filter customers based on search term
  const filteredCustomers = customers.filter(
    (customer) =>
      customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.email.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Customers</h2>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Customer List</CardTitle>
          <CardDescription>View and manage your customers.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center mb-6">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search customers..."
                className="pl-8"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Total Orders</TableHead>
                <TableHead>Last Order Date</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredCustomers.map((customer) => (
                <TableRow key={customer.id}>
                  <TableCell className="font-medium">{customer.name}</TableCell>
                  <TableCell>{customer.email}</TableCell>
                  <TableCell>{customer.totalOrders}</TableCell>
                  <TableCell>{customer.lastOrderDate}</TableCell>
                  <TableCell>
                    <Button variant="outline" onClick={() => setSelectedCustomer(customer)}>
                      View Details
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
              {filteredCustomers.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-4">
                    No customers found matching your search.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Customer Details Dialog */}
      <Dialog open={!!selectedCustomer} onOpenChange={(open) => !open && setSelectedCustomer(null)}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Customer Details</DialogTitle>
            <DialogDescription>View detailed information about this customer.</DialogDescription>
          </DialogHeader>

          {selectedCustomer && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">Name</h3>
                  <p className="text-base">{selectedCustomer.name}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">Email</h3>
                  <p className="text-base">{selectedCustomer.email}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">Total Orders</h3>
                  <p className="text-base">{selectedCustomer.totalOrders}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">Last Order Date</h3>
                  <p className="text-base">{selectedCustomer.lastOrderDate}</p>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-2">Order History</h3>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Order ID</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Total</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {selectedCustomer.orderHistory.map((order) => (
                      <TableRow key={order.id}>
                        <TableCell className="font-medium">{order.id}</TableCell>
                        <TableCell>{order.date}</TableCell>
                        <TableCell>{order.status}</TableCell>
                        <TableCell className="text-right">${order.total.toFixed(2)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}

