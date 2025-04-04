"use client"

import { useState, useEffect } from "react"
import ProductCard from "@/components/Custom/product-card"
import SearchBar from "@/components/Custom/search-bar"
import PriceFilter from "@/components/Custom/price-filter"
import CategoryFilter from "@/components/Custom/category-filter"
import ColorFilter from "@/components/Custom/color-filter"
import { products } from "@/data/productsData"

export default function ProductsPage() {
  const [filteredProducts, setFilteredProducts] = useState(products)
  const [searchQuery, setSearchQuery] = useState("")
  const [priceRange, setPriceRange] = useState([0, 1000])
  const [selectedCategories, setSelectedCategories] = useState([])
  const [selectedColors, setSelectedColors] = useState([])
  const [isMobileFiltersOpen, setIsMobileFiltersOpen] = useState(false)

  // Extract unique categories and colors for filters
  const categories = [...new Set(products.map((product) => product.category))]
  const colors = [...new Set(products.map((product) => product.color))]

  // Apply filters whenever any filter changes
  useEffect(() => {
    const filtered = products.filter((product) => {
      // Search filter
      const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase())

      // Price filter
      const matchesPrice = product.price >= priceRange[0] && product.price <= priceRange[1]

      // Category filter
      const matchesCategory = selectedCategories.length === 0 || selectedCategories.includes(product.category)

      // Color filter
      const matchesColor = selectedColors.length === 0 || selectedColors.includes(product.color)

      return matchesSearch && matchesPrice && matchesCategory && matchesColor
    })

    setFilteredProducts(filtered)
  }, [searchQuery, priceRange, selectedCategories, selectedColors])

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
        </div>

        {/* Products grid */}
        <div className="flex-1">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredProducts.length > 0 ? (
              filteredProducts.map((product) => <ProductCard key={product.id} product={product} />)
            ) : (
              <div className="col-span-full text-center py-10">
                <p className="text-gray-500">No products match your filters.</p>
                <button
                  className="mt-4 px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300"
                  onClick={() => {
                    setSearchQuery("")
                    setPriceRange([0, 1000])
                    setSelectedCategories([])
                    setSelectedColors([])
                  }}
                >
                  Clear all filters
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

