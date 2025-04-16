"use client"

import { useState, useEffect, useCallback, useMemo, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import dynamic from 'next/dynamic'
import { Button } from "@/components/ui/button"
import { Loader2 } from "lucide-react"
import { getProducts } from "@/lib/products-api"

// Dynamically import components with loading fallbacks
const ProductCard = dynamic(() => import("@/components/Custom/product-card"), {
  loading: () => <div className="h-64 w-full animate-pulse bg-gray-200 rounded-lg"></div>
})
const SearchBar = dynamic(() => import("@/components/Custom/search-bar"))
const PriceFilter = dynamic(() => import("@/components/Custom/price-filter"))
const CategoryFilter = dynamic(() => import("@/components/Custom/category-filter"))
const ColorFilter = dynamic(() => import("@/components/Custom/color-filter"))

// Memoize filter components to prevent unnecessary re-renders
const MemoizedFilters = ({ 
  searchQuery, 
  setSearchQuery, 
  priceRange, 
  setPriceRange, 
  categories, 
  selectedCategories, 
  setSelectedCategories, 
  colors, 
  selectedColors, 
  setSelectedColors, 
  clearFilters 
}) => {
  return (
    <>
      <SearchBar searchQuery={searchQuery} setSearchQuery={setSearchQuery} />
      <PriceFilter priceRange={priceRange} setPriceRange={setPriceRange} />
      <CategoryFilter
        categories={categories}
        selectedCategories={selectedCategories}
        setSelectedCategories={setSelectedCategories}
      />
      <ColorFilter 
        colors={colors} 
        selectedColors={selectedColors} 
        setSelectedColors={setSelectedColors} 
      />
      <Button 
        variant="outline" 
        onClick={clearFilters}
        className="w-full"
      >
        Clear All Filters
      </Button>
    </>
  )
}

// Create a separate pagination component
const Pagination = ({ pagination, prevPage, nextPage }) => (
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
)

// Create a separate product grid component
const ProductGrid = ({ products, clearFilters }) => {
  if (products.length === 0) {
    return (
      <div className="col-span-full text-center py-10">
        <p className="text-gray-500">No products match your filters.</p>
        <button
          className="mt-4 px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300"
          onClick={clearFilters}
        >
          Clear all filters
        </button>
      </div>
    );
  }
  
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {products.map((product) => (
        <ProductCard key={product.id} product={{
          id: product.id,
          name: product.name,
          price: product.price,
          category: product.category?.name || "Uncategorized",
          color: product.colors[0]?.color?.name || "N/A",
          colorHex: product.colors[0]?.color?.hexValue || "#000000",
          image: product.imageUrl
        }} />
      ))}
    </div>
  );
}

// Optimized debounce function
const debounce = (func, wait) => {
  let timeout;
  return (...args) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
};

export default function ProductsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  // State for products and filters
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    page: 1,
    totalPages: 1,
    hasNextPage: false,
    hasPrevPage: false
  });
  
  // Filter states
  const [searchQuery, setSearchQuery] = useState(searchParams.get("search") || "");
  const [priceRange, setPriceRange] = useState([
    parseInt(searchParams.get("minPrice") || 0), 
    parseInt(searchParams.get("maxPrice") || 10000)
  ]);
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [selectedColors, setSelectedColors] = useState([]);
  const [isMobileFiltersOpen, setIsMobileFiltersOpen] = useState(false);
  const [categories, setCategories] = useState([]);
  const [colors, setColors] = useState([]);
  const [currentPage, setCurrentPage] = useState(parseInt(searchParams.get("page") || 1));
  
  // Track if this is the first render
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  
  // Initialize from URL parameters
  useEffect(() => {
    if (isInitialLoad) {
      const categoryParams = searchParams.getAll("category");
      if (categoryParams.length > 0) {
        setSelectedCategories(categoryParams);
      }
      
      const colorParams = searchParams.getAll("color");
      if (colorParams.length > 0) {
        setSelectedColors(colorParams);
      }
      
      setIsInitialLoad(false);
    }
  }, [searchParams, isInitialLoad]);
  
  // Fetch products with current filters - useCallback to avoid recreation on every render
  const fetchProducts = useCallback(async (page = currentPage) => {
    setLoading(true);
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
      });
      
      // Check if data.products exists and is an array
      if (!data || !data.products || !Array.isArray(data.products)) {
        console.error("Invalid products data:", data);
        setError("Invalid response format from the server");
        setProducts([]);
        return;
      }
      
      setProducts(data.products);
      setPagination(data.pagination || {
        page: page,
        totalPages: 1,
        hasNextPage: false,
        hasPrevPage: page > 1
      });
      
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
      }
      
      setError(null);
    } catch (err) {
      console.error("Failed to fetch products:", err);
      setError("Failed to load products. Please try again.");
      setProducts([]);
    } finally {
      setLoading(false);
    }
  }, [currentPage, searchQuery, priceRange, selectedCategories, selectedColors, categories.length, colors.length]);

  // Create a debounced version of fetchProducts
  const debouncedFetchProducts = useMemo(
    () => debounce(() => {
      fetchProducts(1);
      setCurrentPage(1);
    }, 500),
    [fetchProducts]
  );

  // Update URL with current filter parameters
  const updateUrl = useCallback(() => {
    const params = new URLSearchParams();
    if (searchQuery) params.set("search", searchQuery);
    if (priceRange[0] > 0) params.set("minPrice", priceRange[0].toString());
    if (priceRange[1] < 10000) params.set("maxPrice", priceRange[1].toString());
    
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
    
    if (currentPage > 1) params.set("page", currentPage.toString());
    
    const url = `${window.location.pathname}?${params.toString()}`;
    window.history.replaceState({}, "", url);
  }, [searchQuery, priceRange, selectedCategories, selectedColors, currentPage]);
  
  // Handle filter changes
  useEffect(() => {
    // Skip on initial load to avoid double fetching
    if (isInitialLoad) return;
    
    debouncedFetchProducts();
    updateUrl();
  }, [searchQuery, priceRange, selectedCategories, selectedColors, debouncedFetchProducts, updateUrl, isInitialLoad]);
  
  // Handle page changes
  useEffect(() => {
    if (currentPage > 0 && !isInitialLoad) {
      fetchProducts(currentPage);
      updateUrl();
    }
  }, [currentPage, fetchProducts, updateUrl, isInitialLoad]);
  
  // Initial load
  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);
  
  // Pagination controls
  const nextPage = useCallback(() => {
    if (pagination.hasNextPage) {
      setCurrentPage(prev => prev + 1);
    }
  }, [pagination.hasNextPage]);
  
  const prevPage = useCallback(() => {
    if (pagination.hasPrevPage) {
      setCurrentPage(prev => prev - 1);
    }
  }, [pagination.hasPrevPage]);
  
  // Clear all filters
  const clearFilters = useCallback(() => {
    setSearchQuery("");
    setPriceRange([0, 10000]);
    setSelectedCategories([]);
    setSelectedColors([]);
    setCurrentPage(1);
  }, []);

  // Memoize the filters component
  const memoizedFilters = useMemo(() => (
    <MemoizedFilters
      searchQuery={searchQuery}
      setSearchQuery={setSearchQuery}
      priceRange={priceRange}
      setPriceRange={setPriceRange}
      categories={categories}
      selectedCategories={selectedCategories}
      setSelectedCategories={setSelectedCategories}
      colors={colors}
      selectedColors={selectedColors}
      setSelectedColors={setSelectedColors}
      clearFilters={clearFilters}
    />
  ), [searchQuery, priceRange, categories, selectedCategories, colors, selectedColors, clearFilters]);

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
        <div className={`${isMobileFiltersOpen ? "block" : "hidden"} md:block w-full md:w-64 space-y-6 md:sticky md:top-20 md:self-start`}>
          {memoizedFilters}
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
              <Suspense fallback={<div className="h-64 flex justify-center items-center"><Loader2 className="h-8 w-8 animate-spin text-gray-400" /></div>}>
                <ProductGrid products={products} clearFilters={clearFilters} />
              </Suspense>
              
              {/* Pagination */}
              {products.length > 0 && (
                <Pagination 
                  pagination={pagination} 
                  prevPage={prevPage} 
                  nextPage={nextPage} 
                />
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

