"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import ProductCard from "@/components/Custom/product-card"
import SearchBar from "@/components/Custom/search-bar"
import PriceFilter from "@/components/Custom/price-filter"
import CategoryFilter from "@/components/Custom/category-filter"
import ColorFilter from "@/components/Custom/color-filter"
import { getProducts } from "@/lib/products-api"
import { Button } from "@/components/ui/button"
import { Loader2 } from "lucide-react"

export default function ProductsPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  
  // State for products and filters
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [pagination, setPagination] = useState({
    page: 1,
    totalPages: 1,
    hasNextPage: false,
    hasPrevPage: false
  })
  
  // Filter states
  const [searchQuery, setSearchQuery] = useState(searchParams.get("search") || "")
  const [priceRange, setPriceRange] = useState([
    parseInt(searchParams.get("minPrice") || 0), 
    parseInt(searchParams.get("maxPrice") || 10000) // Updated to 10000
  ])
  const [selectedCategories, setSelectedCategories] = useState([])
  const [selectedColors, setSelectedColors] = useState([])
  const [isMobileFiltersOpen, setIsMobileFiltersOpen] = useState(false)
  const [categories, setCategories] = useState([])
  const [colors, setColors] = useState([])
  const [currentPage, setCurrentPage] = useState(parseInt(searchParams.get("page") || 1))
  
  // Fetch products with current filters
  const fetchProducts = async (page = currentPage) => {
    setLoading(true)
    try {
      // Extract category IDs for API
      const categoryIds = selectedCategories.map(cat => 
        typeof cat === 'object' ? cat.id : cat
      ).filter(Boolean);
      
      // Extract color IDs for API
      const colorIds = selectedColors.map(color => 
        typeof color === 'object' ? color.id : color
      ).filter(Boolean);
      
      const data = await getProducts({
        search: searchQuery,
        minPrice: priceRange[0],
        maxPrice: priceRange[1],
        categories: categoryIds,
        colors: colorIds,
        page: page,
        limit: 12,
      })
      
      // Debug the API response
      console.log("API Response:", data)
      
      // Check if data.products exists and is an array
      if (!data || !data.products || !Array.isArray(data.products)) {
        console.error("Invalid products data:", data)
        setError("Invalid response format from the server")
        setProducts([])
        return
      }
      
      setProducts(data.products)
      setPagination(data.pagination || {
        page: page,
        totalPages: 1,
        hasNextPage: false,
        hasPrevPage: page > 1
      })
      
      // Extract unique categories and colors for filters if first load
      if (categories.length === 0 && data.products.length > 0) {
        const uniqueCategories = data.products
          .map(p => p.category)
          .filter(Boolean)
          .filter((cat, index, self) => 
            index === self.findIndex((c) => c.id === cat.id)
          );
        setCategories(uniqueCategories);
      }
      
      if (colors.length === 0 && data.products.length > 0) {
        try {
          const uniqueColors = data.products.flatMap(p => 
            (p.colors && Array.isArray(p.colors)) 
              ? p.colors.map(c => ({ 
                  id: c.color?.id, 
                  name: c.color?.name, 
                  hexValue: c.color?.hexValue 
                })).filter(color => color.id && color.name)
              : []
          ).filter((v, i, a) => a.findIndex(t => t.id === v.id) === i);
          
          setColors(uniqueColors);
        } catch (colorErr) {
          console.error("Error extracting colors:", colorErr)
        }
      }
      
      setError(null)
    } catch (err) {
      console.error("Failed to fetch products:", err)
      setError("Failed to load products. Please try again.")
      setProducts([])
    } finally {
      setLoading(false)
    }
  }

  // Handle filter changes
  useEffect(() => {
    // Small delay to avoid too many API calls while typing
    const timer = setTimeout(() => {
      fetchProducts(1) // Reset to first page on filter change
      setCurrentPage(1)
      
      // Update URL with filter parameters
      const params = new URLSearchParams()
      if (searchQuery) params.set("search", searchQuery)
      if (priceRange[0] > 0) params.set("minPrice", priceRange[0].toString())
      if (priceRange[1] < 10000) params.set("maxPrice", priceRange[1].toString()) // Updated to 10000
      
      // Add category and color IDs to URL if selected
      if (selectedCategories.length > 0) {
        selectedCategories.forEach(cat => {
          const catId = typeof cat === 'object' ? cat.id : cat;
          if (catId) params.append("category", catId.toString());
        });
      }
      
      if (selectedColors.length > 0) {
        selectedColors.forEach(color => {
          const colorId = typeof color === 'object' ? color.id : color;
          if (colorId) params.append("color", colorId.toString());
        });
      }
      
      if (currentPage > 1) params.set("page", currentPage.toString())
      
      const url = `${window.location.pathname}?${params.toString()}`
      window.history.replaceState({}, "", url)
    }, 500)
    
    return () => clearTimeout(timer)
  }, [searchQuery, priceRange, selectedCategories, selectedColors])
  
  // Handle page changes
  useEffect(() => {
    if (currentPage > 0) {
      fetchProducts(currentPage)
      
      const params = new URLSearchParams(window.location.search)
      params.set("page", currentPage.toString())
      const url = `${window.location.pathname}?${params.toString()}`
      window.history.replaceState({}, "", url)
    }
  }, [currentPage])
  
  // Initial load
  useEffect(() => {
    fetchProducts()
  }, [])
  
  // Pagination controls
  const nextPage = () => {
    if (pagination.hasNextPage) {
      setCurrentPage(prev => prev + 1)
    }
  }
  
  const prevPage = () => {
    if (pagination.hasPrevPage) {
      setCurrentPage(prev => prev - 1)
    }
  }
  
  // Clear all filters
  const clearFilters = () => {
    setSearchQuery("")
    setPriceRange([0, 10000]) // Updated to 10000
    setSelectedCategories([])
    setSelectedColors([])
    setCurrentPage(1)
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Our Products</h1>

      {/* Mobile filter toggle */}
      <button
        className="md:hidden w-full py-2 px-4 bg-gray-100 rounded-lg mb-4 flex items-center justify-between"
        onClick={() => setIsMobileFiltersOpen(!isMobileFiltersOpen)}
      >
        <span className="font-medium">Filters</span>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={`h-5 w-5 transition-transform ${isMobileFiltersOpen ? "rotate-180" : ""}`}
        >
          <path d="m6 9 6 6 6-6" />
        </svg>
      </button>

      <div className="flex flex-col md:flex-row gap-6">
        {/* Filters sidebar */}
        <div className={`${isMobileFiltersOpen ? "block" : "hidden"} md:block w-full md:w-64 space-y-6`}>
          <SearchBar searchQuery={searchQuery} setSearchQuery={setSearchQuery} />

          <PriceFilter priceRange={priceRange} setPriceRange={setPriceRange} />

          <CategoryFilter
            categories={categories}
            selectedCategories={selectedCategories}
            setSelectedCategories={setSelectedCategories}
          />

          <ColorFilter colors={colors} selectedColors={selectedColors} setSelectedColors={setSelectedColors} />
          
          {/* Clear filters button */}
          <Button 
            variant="outline" 
            onClick={clearFilters}
            className="w-full"
          >
            Clear All Filters
          </Button>
        </div>

        {/* Products grid */}
        <div className="flex-1">
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
            </div>
          ) : error ? (
            <div className="text-center py-10">
              <p className="text-red-500">{error}</p>
              <button
                className="mt-4 px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300"
                onClick={() => fetchProducts()}
              >
                Try Again
              </button>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {products.length > 0 ? (
                  products.map((product) => (
                    <ProductCard key={product.id} product={{
                      id: product.id,
                      name: product.name,
                      price: product.price,
                      category: product.category?.name || "Uncategorized",
                      color: product.colors[0]?.color?.name || "N/A",
                      colorHex: product.colors[0]?.color?.hexValue || "#000000",
                      image: product.imageUrl
                    }} />
                  ))
                ) : (
                  <div className="col-span-full text-center py-10">
                    <p className="text-gray-500">No products match your filters.</p>
                    <button
                      className="mt-4 px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300"
                      onClick={clearFilters}
                    >
                      Clear all filters
                    </button>
                  </div>
                )}
              </div>
              
              {/* Pagination */}
              {products.length > 0 && (
                <div className="flex justify-between items-center mt-8">
                  <Button 
                    variant="outline" 
                    onClick={prevPage} 
                    disabled={!pagination.hasPrevPage}
                  >
                    Previous
                  </Button>
                  
                  <span className="text-sm text-gray-600">
                    Page {pagination.page} of {pagination.totalPages}
                  </span>
                  
                  <Button 
                    variant="outline" 
                    onClick={nextPage} 
                    disabled={!pagination.hasNextPage}
                  >
                    Next
                  </Button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}

