"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { format } from "date-fns"
import { CalendarIcon,ChevronDown,Check} from "lucide-react"
import { Badge } from "@/components/ui/badge"

export default function CampaignsPage() {
  const [startDate, setStartDate] = useState(null)
  const [selectedProducts, setSelectedProducts] = useState([])
  const [endDate, setEndDate] = useState(null)
  const toggleProduct = (productId) => {
    setSelectedProducts((prev) =>
      prev.includes(productId)
        ? prev.filter((id) => id !== productId)
        : [...prev, productId]
    )
  }
  // Sample data
  const campaigns = [
    {
      id: 1,
      name: "Summer Sale",
      products: ["Basic T-Shirt", "Premium Hoodie"],
      startDate: "2023-06-01",
      endDate: "2023-06-30",
      cost: 500.0,
      status: "Upcoming",
    },
    {
      id: 2,
      name: "Back to School",
      products: ["Premium Hoodie", "Wireless Earbuds"],
      startDate: "2023-08-15",
      endDate: "2023-09-15",
      cost: 750.0,
      status: "Upcoming",
    },
    {
      id: 3,
      name: "Spring Collection",
      products: ["Basic T-Shirt"],
      startDate: "2023-03-01",
      endDate: "2023-04-15",
      cost: 350.0,
      status: "Completed",
    },
  ]

  const products = [
    { id: 1, name: "Basic T-Shirt" },
    { id: 2, name: "Premium Hoodie" },
    { id: 3, name: "Wireless Earbuds" },
    { id: 4, name: "Smart Watch" },
    { id: 5, name: "Laptop Sleeve" },
  ]

  const getStatusColor = (status) => {
    switch (status) {
      case "Active":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
      case "Upcoming":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300"
      case "Completed":
        return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300"
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300"
    }
  }

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Campaigns</h2>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Create New Campaign</CardTitle>
          <CardDescription>Launch a new marketing campaign.</CardDescription>
        </CardHeader>
        <CardContent>
          <form className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="grid gap-2">
                <Label htmlFor="campaignName">Campaign Name</Label>
                <Input id="campaignName" placeholder="Enter campaign name" />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="campaignCost">Campaign Cost ($)</Label>
                <Input id="campaignCost" type="number" step="0.01" placeholder="0.00" />
              </div>
            </div>

            <div className="grid gap-4">
            <div className="grid gap-2">
                <Label>Target Products</Label>
                <Popover>
                <PopoverTrigger asChild>
                    <Button variant="outline" className="w-full justify-between">
                    {selectedProducts.length > 0
                        ? `${selectedProducts.length} product(s) selected`
                        : "Select target products"}
                    <ChevronDown className="ml-2 h-4 w-4 opacity-50" />
                    </Button>
                </PopoverTrigger>
                <PopoverContent className="max-h-64 w-full overflow-y-auto p-2">
                    {products.map((product) => (
                    <div
                        key={product.id}
                        onClick={() => toggleProduct(product.id)}
                        className="flex items-center justify-between px-2 py-1 cursor-pointer rounded hover:bg-muted"
                    >
                        <span>{product.name}</span>
                        {selectedProducts.includes(product.id) && (
                        <Check className="w-4 h-4 text-primary" />
                        )}
                    </div>
                    ))}
                </PopoverContent>
                </Popover>
            </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="grid gap-2">
                <Label>Start Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="w-full justify-start text-left font-normal">
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {startDate ? format(startDate, "PPP") : "Select start date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar mode="single" selected={startDate} onSelect={setStartDate} initialFocus />
                  </PopoverContent>
                </Popover>
              </div>

              <div className="grid gap-2">
                <Label>End Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="w-full justify-start text-left font-normal">
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {endDate ? format(endDate, "PPP") : "Select end date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar mode="single" selected={endDate} onSelect={setEndDate} initialFocus />
                  </PopoverContent>
                </Popover>
              </div>
            </div>

            <Button className="w-full md:w-auto">Create Campaign</Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Campaign List</CardTitle>
          <CardDescription>View and manage your marketing campaigns.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Products</TableHead>
                <TableHead>Start Date</TableHead>
                <TableHead>End Date</TableHead>
                <TableHead>Cost</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {campaigns.map((campaign) => (
                <TableRow key={campaign.id}>
                  <TableCell className="font-medium">{campaign.name}</TableCell>
                  <TableCell>{campaign.products.join(", ")}</TableCell>
                  <TableCell>{campaign.startDate}</TableCell>
                  <TableCell>{campaign.endDate}</TableCell>
                  <TableCell>${campaign.cost.toFixed(2)}</TableCell>
                  <TableCell>
                    <Badge className={getStatusColor(campaign.status)}>{campaign.status}</Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}

