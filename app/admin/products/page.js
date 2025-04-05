"use client"

import { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { ChevronDown, ChevronUp, Edit, Trash,Check } from "lucide-react"

export default function ProductsPage() {
  const [expandedProduct, setExpandedProduct] = useState(null)
  const [selectedColors, setSelectedColors] = useState([])
  const [selectedSizes, setSelectedSizes] = useState([])

  const toggleSelect = (option, selected, setSelected) => {
    if (selected.includes(option)) {
      setSelected(selected.filter((o) => o !== option))
    } else {
      setSelected([...selected, option])
    }
  }
  // Sample data
  const products = [
    {
      id: 1,
      name: "Basic T-Shirt",
      colors: ["Black", "White", "Gray"],
      sizes: ["S", "M", "L", "XL"],
      category: "Clothing",
      buyingPrice: 10.0,
      sellingPrice: 24.99,
      stock: 150,
    },
    {
      id: 2,
      name: "Premium Hoodie",
      colors: ["Black", "Navy", "Green"],
      sizes: ["M", "L", "XL"],
      category: "Clothing",
      buyingPrice: 25.0,
      sellingPrice: 59.99,
      stock: 75,
    },
    {
      id: 3,
      name: "Wireless Earbuds",
      colors: ["White", "Black"],
      sizes: [],
      category: "Electronics",
      buyingPrice: 35.0,
      sellingPrice: 89.99,
      stock: 50,
    },
  ]

  const categories = [
    { id: 1, name: "Clothing" },
    { id: 2, name: "Electronics" },
    { id: 3, name: "Home & Kitchen" },
    { id: 4, name: "Beauty" },
  ]

  const colorOptions = ["Black", "White", "Gray", "Red", "Blue", "Green", "Navy", "Purple", "Yellow"]
  const sizeOptions = ["XS", "S", "M", "L", "XL", "XXL"]

  const toggleProductExpand = (id) => {
    if (expandedProduct === id) {
      setExpandedProduct(null)
    } else {
      setExpandedProduct(id)
    }
  }

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Products</h2>
      </div>

      <Tabs defaultValue="products" className="space-y-4">
        <TabsList>
          <TabsTrigger value="products">Products</TabsTrigger>
          <TabsTrigger value="categories">Categories</TabsTrigger>
        </TabsList>

        <TabsContent value="products" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Add New Product</CardTitle>
              <CardDescription>Enter the details for a new product.</CardDescription>
            </CardHeader>
            <CardContent>
              <form className="grid gap-6 md:grid-cols-2">
                <div className="grid gap-3">
                  <Label htmlFor="name">Product Name</Label>
                  <Input id="name" placeholder="Enter product name" />
                </div>

                <div className="grid gap-3">
                  <Label>Category</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((category) => (
                        <SelectItem key={category.id} value={category.name}>
                          {category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Colors Multi-select */}
                <div className="grid gap-2">
                  <Label>Colors</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className="w-full justify-between"
                      >
                        {selectedColors.length > 0
                          ? selectedColors.join(", ")
                          : "Select colors"}
                        <ChevronDown className="ml-2 h-4 w-4 opacity-50" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-full p-2">
                      {colorOptions.map((color) => (
                        <div
                          key={color}
                          className="w-20 flex items-center justify-between px-2 py-1 cursor-pointer rounded hover:bg-muted"
                          onClick={() => toggleSelect(color, selectedColors, setSelectedColors)}
                        >
                          <span>{color}</span>
                          {selectedColors.includes(color) && <Check className="w-4 h-4 text-primary" />}
                        </div>
                      ))}
                    </PopoverContent>
                  </Popover>
                </div>

                {/* Sizes Multi-select */}
                <div className="grid gap-2">
                  <Label>Sizes</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className="w-full justify-between"
                      >
                        {selectedSizes.length > 0
                          ? selectedSizes.join(", ")
                          : "Select sizes"}
                        <ChevronDown className="ml-2 h-4 w-4 opacity-50" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-full p-2">
                      {sizeOptions.map((size) => (
                        <div
                          key={size}
                          className="flex items-center justify-between px-2 py-1 cursor-pointer rounded hover:bg-muted"
                          onClick={() => toggleSelect(size, selectedSizes, setSelectedSizes)}
                        >
                          <span>{size}</span>
                          {selectedSizes.includes(size) && <Check className="w-4 h-4 text-primary" />}
                        </div>
                      ))}
                    </PopoverContent>
                  </Popover>
                </div>

                <div className="grid gap-3">
                  <Label htmlFor="buyingPrice">Buying Price ($)</Label>
                  <Input id="buyingPrice" type="number" step="0.01" placeholder="0.00" />
                </div>

                <div className="grid gap-3">
                  <Label htmlFor="sellingPrice">Selling Price ($)</Label>
                  <Input id="sellingPrice" type="number" step="0.01" placeholder="0.00" />
                </div>

                <div className="grid gap-3">
                  <Label htmlFor="stock">Stock Quantity</Label>
                  <Input id="stock" type="number" placeholder="0" />
                </div>

                <div className="flex items-end">
                  <Button className="w-full">Add Product</Button>
                </div>
              </form>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Product List</CardTitle>
              <CardDescription>Manage your products inventory.</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[250px]">Name</TableHead>
                    <TableHead>Colors</TableHead>
                    <TableHead>Sizes</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Buying Price</TableHead>
                    <TableHead>Selling Price</TableHead>
                    <TableHead>Stock</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {products.map((product) => (
                    <>
                      <TableRow
                        key={product.id}
                        className="cursor-pointer"
                        onClick={() => toggleProductExpand(product.id)}
                      >
                        <TableCell className="font-medium">{product.name}</TableCell>
                        <TableCell>{product.colors.join(", ")}</TableCell>
                        <TableCell>{product.sizes.join(", ") || "N/A"}</TableCell>
                        <TableCell>{product.category}</TableCell>
                        <TableCell>${product.buyingPrice.toFixed(2)}</TableCell>
                        <TableCell>${product.sellingPrice.toFixed(2)}</TableCell>
                        <TableCell>{product.stock}</TableCell>
                        <TableCell>
                          <div className="flex space-x-2">
                            <Button variant="outline" size="icon">
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button variant="outline" size="icon">
                              <Trash className="h-4 w-4" />
                            </Button>
                            {expandedProduct === product.id ? (
                              <ChevronUp className="h-4 w-4" />
                            ) : (
                              <ChevronDown className="h-4 w-4" />
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                      {expandedProduct === product.id && (
                        <TableRow>
                          <TableCell colSpan={8} className="bg-muted/50">
                            <div className="p-4">
                              <h3 className="font-semibold mb-2">Edit Stock</h3>
                              <div className="flex items-center space-x-4">
                                <div className="grid gap-2">
                                  <Label htmlFor={`stock-${product.id}`}>Current Stock: {product.stock}</Label>
                                  <Input
                                    id={`stock-${product.id}`}
                                    type="number"
                                    defaultValue={product.stock}
                                    className="w-32"
                                  />
                                </div>
                                <Button>Update Stock</Button>
                              </div>
                            </div>
                          </TableCell>
                        </TableRow>
                      )}
                    </>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="categories" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Add New Category</CardTitle>
              <CardDescription>Create a new product category.</CardDescription>
            </CardHeader>
            <CardContent>
              <form className="grid gap-4 md:grid-cols-2">
                <div className="grid gap-3">
                  <Label htmlFor="categoryName">Category Name</Label>
                  <Input id="categoryName" placeholder="Enter category name" />
                </div>
                <div className="flex items-end">
                  <Button>Add Category</Button>
                </div>
              </form>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Categories</CardTitle>
              <CardDescription>Manage your product categories.</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Products Count</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {categories.map((category) => (
                    <TableRow key={category.id}>
                      <TableCell className="font-medium">{category.name}</TableCell>
                      <TableCell>{category.id === 1 ? 2 : category.id === 2 ? 1 : 0}</TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <Button variant="outline" size="icon">
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="outline" size="icon">
                            <Trash className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

