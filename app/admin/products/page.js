"use client"

import { useState, useEffect, useRef } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { ChevronDown, ChevronUp, Edit, Trash, Check, Upload, ImageIcon, X } from "lucide-react"
import { Textarea } from "@/components/ui/textarea"

export default function ProductsPage() {
  // Product state
  const [products, setProducts] = useState([])
  const [categories, setCategories] = useState([])
  const [expandedProduct, setExpandedProduct] = useState(null)
  const [selectedColors, setSelectedColors] = useState([])
  const [selectedSizes, setSelectedSizes] = useState([])
  const [loading, setLoading] = useState(true)
  const [productImage, setProductImage] = useState(null)
  const [productImagePreview, setProductImagePreview] = useState(null)
  const fileInputRef = useRef(null)
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    categoryId: "",
    stock: 0,
    buyingPrice: 0,
    sellingPrice: 0
  })

  // Category state
  const [categoryName, setCategoryName] = useState("")
  const [editCategoryId, setEditCategoryId] = useState(null)
  const [editCategoryName, setEditCategoryName] = useState("")
  const [categoryError, setCategoryError] = useState("")
  const [categoryLoading, setCategoryLoading] = useState(false)

  // Color and size options
  const colorOptions = ["Black", "White", "Gray", "Red", "Blue", "Green", "Navy", "Purple", "Yellow"]
  const sizeOptions = ["XS", "S", "M", "L", "XL", "XXL"]

  // Fetch products and categories on page load
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)

        // Fetch products
        const productsRes = await fetch('/api/products')
        if (!productsRes.ok) throw new Error('Failed to fetch products')
        const productsData = await productsRes.json()
        
        // Ensure productsData is an array before setting it to state
        if (Array.isArray(productsData)) {
          setProducts(productsData)
        } else if (productsData && typeof productsData === 'object') {
          // If response is an object that has a products property which is an array
          if (Array.isArray(productsData.products)) {
            setProducts(productsData.products)
          } else {
            // If it's an object but doesn't have a products array, set empty array
            console.error("API response is not an array or doesn't contain a products array:", productsData)
            setProducts([])
          }
        } else {
          // For any other case, set an empty array
          console.error("Invalid API response format:", productsData)
          setProducts([])
        }
        
        // Fetch categories
        const categoriesRes = await fetch('/api/categories')
        if (!categoriesRes.ok) throw new Error('Failed to fetch categories')
        const categoriesData = await categoriesRes.json()
        setCategories(categoriesData)
      } catch (error) {
        console.error("Error fetching data:", error)
        // Ensure products is an array even when there's an error
        setProducts([])
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  // Handle image selection
  const handleImageChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      setProductImage(file)
      // Create a preview URL
      const reader = new FileReader()
      reader.onloadend = () => {
        setProductImagePreview(reader.result)
      }
      reader.readAsDataURL(file)
    }
  }

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  // Handle color selection
  const toggleSelect = (option, selected, setSelected) => {
    if (selected.includes(option)) {
      setSelected(selected.filter((o) => o !== option))
    } else {
      setSelected([...selected, option])
    }
  }

  // Submit new product
  const handleAddProduct = async (e) => {
    e.preventDefault()
    
    try {
      const formDataToSend = new FormData()
      formDataToSend.append("name", formData.name)
      formDataToSend.append("description", formData.description)
      formDataToSend.append("categoryId", formData.categoryId)
      formDataToSend.append("costPrice", formData.buyingPrice)
      formDataToSend.append("price", formData.sellingPrice)
      formDataToSend.append("stock", formData.stock)
      
      // Add image if selected
      if (productImage) {
        formDataToSend.append("image", productImage)
      }
      
      // Add colors and sizes as JSON strings
      formDataToSend.append("colors", JSON.stringify(selectedColors))
      formDataToSend.append("sizes", JSON.stringify(selectedSizes))
      
      const response = await fetch('/api/products', {
        method: 'POST',
        body: formDataToSend,
      })
      
      if (!response.ok) {
        throw new Error('Failed to add product')
      }
      
      const newProduct = await response.json()
      
      // Reset form
      setFormData({
        name: "",
        description: "",
        categoryId: "",
        stock: 0,
        buyingPrice: 0,
        sellingPrice: 0
      })
      setSelectedColors([])
      setSelectedSizes([])
      setProductImage(null)
      setProductImagePreview(null)
      
      // Update products list
      setProducts(prev => [...prev, newProduct])
      
      alert('Product added successfully!')
    } catch (error) {
      console.error('Error adding product:', error)
      alert('Failed to add product. Please try again.')
    }
  }

  // Delete product
  const handleDeleteProduct = async (id) => {
    if (!confirm('Are you sure you want to delete this product?')) return
    
    try {
      const response = await fetch(`/api/products?id=${id}`, {
        method: 'DELETE'
      })
      
      if (!response.ok) {
        throw new Error('Failed to delete product')
      }
      
      // Remove product from list
      setProducts(prev => prev.filter(product => product.id !== id))
      alert('Product deleted successfully!')
    } catch (error) {
      console.error('Error deleting product:', error)
      alert('Failed to delete product. Please try again.')
    }
  }

  // Update stock
  const handleUpdateStock = async (id, newStock) => {
    try {
      const product = products.find(p => p.id === id)
      if (!product) return
      
      const formDataToSend = new FormData()
      formDataToSend.append("id", id)
      formDataToSend.append("name", product.name)
      formDataToSend.append("description", product.description || "")
      formDataToSend.append("categoryId", product.categoryId)
      formDataToSend.append("costPrice", product.costPrice)
      formDataToSend.append("price", product.price)
      formDataToSend.append("stock", newStock)
      
      const response = await fetch('/api/products', {
        method: 'PUT',
        body: formDataToSend,
      })
      
      if (!response.ok) {
        throw new Error('Failed to update product')
      }
      
      // Update product in list
      setProducts(prev => prev.map(p => 
        p.id === id ? {...p, stock: newStock} : p
      ))
      
      alert('Stock updated successfully!')
    } catch (error) {
      console.error('Error updating stock:', error)
      alert('Failed to update stock. Please try again.')
    }
  }

  // Toggle product expansion
  const toggleProductExpand = (id) => {
    if (expandedProduct === id) {
      setExpandedProduct(null)
    } else {
      setExpandedProduct(id)
    }
  }

  // Category Functions
  const handleAddCategory = async (e) => {
    e.preventDefault()
    setCategoryError("")
    
    if (!categoryName.trim()) {
      setCategoryError("Category name is required")
      return
    }
    
    try {
      setCategoryLoading(true)
      
      const response = await fetch('/api/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: categoryName }),
      })
      
      const data = await response.json()
      
      if (!response.ok) {
        setCategoryError(data.error || "Failed to add category")
        return
      }
      
      // Add new category to list
      setCategories(prev => [...prev, {
        id: data.id,
        name: data.name,
        productsCount: 0
      }])
      
      // Reset form
      setCategoryName("")
    } catch (error) {
      console.error('Error adding category:', error)
      setCategoryError("An unexpected error occurred")
    } finally {
      setCategoryLoading(false)
    }
  }
  
  const startEditCategory = (category) => {
    setEditCategoryId(category.id)
    setEditCategoryName(category.name)
    setCategoryError("")
  }
  
  const cancelEditCategory = () => {
    setEditCategoryId(null)
    setEditCategoryName("")
    setCategoryError("")
  }
  
  const handleUpdateCategory = async (id) => {
    setCategoryError("")
    
    if (!editCategoryName.trim()) {
      setCategoryError("Category name is required")
      return
    }
    
    try {
      setCategoryLoading(true)
      
      const response = await fetch('/api/categories', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, name: editCategoryName }),
      })
      
      const data = await response.json()
      
      if (!response.ok) {
        setCategoryError(data.error || "Failed to update category")
        return
      }
      
      // Update category in list
      setCategories(prev => prev.map(cat => 
        cat.id === id ? { ...cat, name: editCategoryName } : cat
      ))
      
      // Reset edit state
      setEditCategoryId(null)
      setEditCategoryName("")
    } catch (error) {
      console.error('Error updating category:', error)
      setCategoryError("An unexpected error occurred")
    } finally {
      setCategoryLoading(false)
    }
  }
  
  const handleDeleteCategory = async (id) => {
    const category = categories.find(c => c.id === id)
    if (!category) return
    
    if (!confirm(`Are you sure you want to delete the category "${category.name}"?`)) {
      return
    }
    
    try {
      setCategoryLoading(true)
      
      const response = await fetch(`/api/categories?id=${id}`, {
        method: 'DELETE',
      })
      
      if (!response.ok) {
        const data = await response.json()
        alert(data.error || "Failed to delete category")
        return
      }
      
      // Remove category from list
      setCategories(prev => prev.filter(cat => cat.id !== id))
    } catch (error) {
      console.error('Error deleting category:', error)
      alert("Failed to delete category. Please try again.")
    } finally {
      setCategoryLoading(false)
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
              <form onSubmit={handleAddProduct} className="grid gap-6 md:grid-cols-2">
                <div className="grid gap-3">
                  <Label htmlFor="name">Product Name</Label>
                  <Input 
                    id="name" 
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="Enter product name" 
                    required 
                  />
                </div>

                <div className="grid gap-3">
                  <Label>Category</Label>
                  <Select 
                    onValueChange={(value) => setFormData(prev => ({...prev, categoryId: value}))}
                    value={formData.categoryId}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((category) => (
                        <SelectItem key={category.id} value={category.id.toString()}>
                          {category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid gap-3 md:col-span-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea 
                    id="description" 
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    placeholder="Enter product description" 
                    rows={3}
                  />
                </div>

                {/* Image Upload */}
                <div className="grid gap-3 md:col-span-2">
                  <Label>Product Image</Label>
                  <div className="flex items-center gap-4">
                    <div 
                      className="border-2 border-dashed rounded-lg p-4 flex flex-col items-center justify-center cursor-pointer hover:bg-muted/50"
                      onClick={() => fileInputRef.current.click()}
                      style={{width: '150px', height: '150px'}}
                    >
                      {productImagePreview ? (
                        <img 
                          src={productImagePreview} 
                          alt="Product preview" 
                          className="max-h-full max-w-full object-contain"
                        />
                      ) : (
                        <>
                          <Upload className="w-8 h-8 mb-2 text-muted-foreground" />
                          <span className="text-sm text-muted-foreground">Click to upload</span>
                        </>
                      )}
                    </div>
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleImageChange}
                      accept="image/*"
                      className="hidden"
                    />
                    {productImage && (
                      <div>
                        <p className="text-sm">{productImage.name}</p>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="mt-2"
                          type="button"
                          onClick={() => {
                            setProductImage(null)
                            setProductImagePreview(null)
                          }}
                        >
                          Remove
                        </Button>
                      </div>
                    )}
                  </div>
                </div>

                {/* Colors Multi-select */}
                <div className="grid gap-2">
                  <Label>Colors</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        type="button"
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
                        type="button"
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
                  <Input 
                    id="buyingPrice" 
                    name="buyingPrice"
                    value={formData.buyingPrice}
                    onChange={handleInputChange}
                    type="number" 
                    step="0.01" 
                    placeholder="0.00" 
                  />
                </div>

                <div className="grid gap-3">
                  <Label htmlFor="sellingPrice">Selling Price ($)</Label>
                  <Input 
                    id="sellingPrice" 
                    name="sellingPrice"
                    value={formData.sellingPrice}
                    onChange={handleInputChange}
                    type="number" 
                    step="0.01" 
                    placeholder="0.00" 
                  />
                </div>

                <div className="grid gap-3">
                  <Label htmlFor="stock">Stock Quantity</Label>
                  <Input 
                    id="stock" 
                    name="stock"
                    value={formData.stock}
                    onChange={handleInputChange}
                    type="number" 
                    placeholder="0" 
                  />
                </div>

                <div className="flex items-end md:col-span-2">
                  <Button type="submit" className="w-full">Add Product</Button>
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
              {loading ? (
                <div className="flex justify-center py-8">Loading products...</div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[250px]">Name</TableHead>
                      <TableHead>Image</TableHead>
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
                    {products.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={9} className="text-center py-4">No products found</TableCell>
                      </TableRow>
                    ) : (
                      products.map((product) => (
                        <>
                          <TableRow
                            key={product.id}
                            className="cursor-pointer"
                            onClick={() => toggleProductExpand(product.id)}
                          >
                            <TableCell className="font-medium">{product.name}</TableCell>
                            <TableCell>
                              {product.imageUrl ? (
                                <img 
                                  src={product.imageUrl} 
                                  alt={product.name}
                                  className="h-10 w-10 object-cover rounded"
                                />
                              ) : (
                                <div className="h-10 w-10 bg-muted flex items-center justify-center rounded">
                                  <ImageIcon className="h-5 w-5 text-muted-foreground" />
                                </div>
                              )}
                            </TableCell>
                            <TableCell>{product.colors?.map(c => c.color.name).join(", ") || "-"}</TableCell>
                            <TableCell>{product.sizes?.map(s => s.size.name).join(", ") || "N/A"}</TableCell>
                            <TableCell>{product.category?.name || "-"}</TableCell>
                            <TableCell>${product.costPrice?.toFixed(2) || "0.00"}</TableCell>
                            <TableCell>${product.price?.toFixed(2) || "0.00"}</TableCell>
                            <TableCell>{product.stock}</TableCell>
                            <TableCell>
                              <div className="flex space-x-2">
                                <Button variant="outline" size="icon">
                                  <Edit className="h-4 w-4" />
                                </Button>
                                <Button 
                                  variant="outline" 
                                  size="icon" 
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    handleDeleteProduct(product.id)
                                  }}
                                >
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
                              <TableCell colSpan={9} className="bg-muted/50">
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
                                    <Button
                                      onClick={(e) => {
                                        e.preventDefault()
                                        const input = document.getElementById(`stock-${product.id}`)
                                        const newStock = parseInt(input.value)
                                        if (!isNaN(newStock)) {
                                          handleUpdateStock(product.id, newStock)
                                        }
                                      }}
                                    >
                                      Update Stock
                                    </Button>
                                  </div>
                                </div>
                              </TableCell>
                            </TableRow>
                          )}
                        </>
                      ))
                    )}
                  </TableBody>
                </Table>
              )}
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
              <form onSubmit={handleAddCategory} className="grid gap-4 md:grid-cols-2">
                <div className="grid gap-3">
                  <Label htmlFor="categoryName">Category Name</Label>
                  <Input 
                    id="categoryName" 
                    value={categoryName}
                    onChange={(e) => setCategoryName(e.target.value)}
                    placeholder="Enter category name" 
                    required
                  />
                  {categoryError && (
                    <p className="text-sm text-red-500">{categoryError}</p>
                  )}
                </div>
                <div className="flex items-end">
                  <Button 
                    type="submit" 
                    disabled={categoryLoading || !categoryName.trim()}
                  >
                    {categoryLoading ? "Adding..." : "Add Category"}
                  </Button>
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
              {loading ? (
                <div className="flex justify-center py-8">Loading categories...</div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Products Count</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {categories.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={3} className="text-center py-4">No categories found</TableCell>
                      </TableRow>
                    ) : (
                      categories.map((category) => (
                        <TableRow key={category.id}>
                          <TableCell className="font-medium">
                            {editCategoryId === category.id ? (
                              <div className="flex items-center space-x-2">
                                <Input 
                                  value={editCategoryName}
                                  onChange={(e) => setEditCategoryName(e.target.value)}
                                  className="max-w-[200px]"
                                />
                                <Button 
                                  variant="ghost" 
                                  size="icon"
                                  onClick={() => handleUpdateCategory(category.id)}
                                  disabled={categoryLoading || !editCategoryName.trim()}
                                >
                                  <Check className="h-4 w-4" />
                                </Button>
                                <Button 
                                  variant="ghost" 
                                  size="icon"
                                  onClick={cancelEditCategory}
                                >
                                  <X className="h-4 w-4" />
                                </Button>
                              </div>
                            ) : (
                              category.name
                            )}
                          </TableCell>
                          <TableCell>{category.productsCount}</TableCell>
                          <TableCell>
                            <div className="flex space-x-2">
                              <Button 
                                variant="outline" 
                                size="icon"
                                disabled={editCategoryId === category.id}
                                onClick={() => startEditCategory(category)}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button 
                                variant="outline" 
                                size="icon"
                                onClick={() => handleDeleteCategory(category.id)}
                                disabled={category.productsCount > 0}
                              >
                                <Trash className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              )}
              {categoryError && (
                <p className="text-sm text-red-500 mt-4">{categoryError}</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

