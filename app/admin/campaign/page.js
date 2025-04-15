"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { format } from "date-fns"
import { CalendarIcon, ChevronDown, Check } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { toast } from "sonner"

export default function CampaignsPage() {
  const [startDate, setStartDate] = useState(null)
  const [endDate, setEndDate] = useState(null)
  const [campaignName, setCampaignName] = useState("")
  const [campaignCost, setCampaignCost] = useState("")
  const [selectedProducts, setSelectedProducts] = useState([])
  const [campaigns, setCampaigns] = useState([])
  const [products, setProducts] = useState([])
  const [isLoading, setIsLoading] = useState(false)

  // Fetch campaigns and products on component mount
  useEffect(() => {
    fetchCampaigns()
    fetchProducts()
  }, [])

  const fetchCampaigns = async () => {
    try {
      const response = await fetch('/api/campaigns')
      if (response.ok) {
        const data = await response.json()
        setCampaigns(data)
      } else {
        toast.error("Failed to fetch campaigns")
      }
    } catch (error) {
      console.error("Error fetching campaigns:", error)
      toast.error("An error occurred while fetching campaigns")
    }
  }

  const fetchProducts = async () => {
    try {
      const response = await fetch('/api/products')
      if (response.ok) {
        const data = await response.json()
        // Ensure we extract the products array from the response
        setProducts(data.products || [])
      } else {
        toast.error("Failed to fetch products")
      }
    } catch (error) {
      console.error("Error fetching products:", error)
      toast.error("An error occurred while fetching products")
    }
  }

  const handleCreateCampaign = async (e) => {
    e.preventDefault()
    
    if (!campaignName || !campaignCost || !startDate || !endDate || selectedProducts.length === 0) {
      toast.error("Please fill in all fields")
      return
    }
    
    if (startDate >= endDate) {
      toast.error("End date must be after start date")
      return
    }
    
    setIsLoading(true)
    
    try {
      const response = await fetch('/api/campaigns', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: campaignName,
          description: "",
          startDate: startDate.toISOString(),
          endDate: endDate.toISOString(),
          budget: parseFloat(campaignCost),
          products: selectedProducts.map(id => {
            return {
              id,
              cost: parseFloat(campaignCost) / selectedProducts.length // Divide budget equally
            }
          })
        }),
      })
      
      if (response.ok) {
        toast.success("Campaign created successfully")
        // Reset form
        setCampaignName("")
        setCampaignCost("")
        setStartDate(null)
        setEndDate(null)
        setSelectedProducts([])
        // Refresh campaigns list
        fetchCampaigns()
      } else {
        const errorData = await response.json()
        toast.error(errorData.error || "Failed to create campaign")
      }
    } catch (error) {
      console.error("Error creating campaign:", error)
      toast.error("An error occurred while creating the campaign")
    } finally {
      setIsLoading(false)
    }
  }

  const toggleProduct = (productId) => {
    setSelectedProducts((prev) =>
      prev.includes(productId)
        ? prev.filter((id) => id !== productId)
        : [...prev, productId]
    )
  }

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
          <form className="space-y-6" onSubmit={handleCreateCampaign}>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="grid gap-2">
                <Label htmlFor="campaignName">Campaign Name</Label>
                <Input 
                  id="campaignName" 
                  placeholder="Enter campaign name"
                  value={campaignName}
                  onChange={(e) => setCampaignName(e.target.value)}
                  required
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="campaignCost">Campaign Cost ($)</Label>
                <Input 
                  id="campaignCost" 
                  type="number" 
                  step="0.01" 
                  placeholder="0.00"
                  value={campaignCost}
                  onChange={(e) => setCampaignCost(e.target.value)}
                  required
                />
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
                    {Array.isArray(products) && products.length > 0 ? (
                      products.map((product) => (
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
                      ))
                    ) : (
                      <div className="px-2 py-1 text-sm text-muted-foreground">No products available</div>
                    )}
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

            <Button type="submit" className="w-full md:w-auto" disabled={isLoading}>
              {isLoading ? "Creating..." : "Create Campaign"}
            </Button>
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
              {campaigns.length > 0 ? (
                campaigns.map((campaign) => (
                  <TableRow key={campaign.id}>
                    <TableCell className="font-medium">{campaign.name}</TableCell>
                    <TableCell>
                      {campaign.products && Array.isArray(campaign.products) 
                        ? campaign.products.map(p => p.name).join(", ")
                        : "No products"}
                    </TableCell>
                    <TableCell>{new Date(campaign.startDate).toLocaleDateString()}</TableCell>
                    <TableCell>{new Date(campaign.endDate).toLocaleDateString()}</TableCell>
                    <TableCell>${campaign.cost.toFixed(2)}</TableCell>
                    <TableCell>
                      <Badge className={getStatusColor(campaign.status)}>{campaign.status}</Badge>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-4">
                    No campaigns found
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

