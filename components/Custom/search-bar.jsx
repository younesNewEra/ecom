"use client"

import { useState, useEffect } from "react"
import { Search } from "lucide-react"

export default function SearchBar({ searchQuery, setSearchQuery }) {
  const [localQuery, setLocalQuery] = useState(searchQuery)

  // Update search query with minimal delay for instant filtering
  useEffect(() => {
    const timer = setTimeout(() => {
      setSearchQuery(localQuery)
    }, 100)

    return () => clearTimeout(timer)
  }, [localQuery, setSearchQuery])

  return (
    <div className="relative">
      <h3 className="font-semibold mb-2">Search Products</h3>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
        <input
          type="text"
          value={localQuery}
          onChange={(e) => setLocalQuery(e.target.value)}
          placeholder="Search products..."
          className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-300"
        />
        {localQuery && (
          <button
            onClick={() => {
              setLocalQuery("")
              setSearchQuery("")
            }}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M18 6 6 18" />
              <path d="m6 6 12 12" />
            </svg>
          </button>
        )}
      </div>
    </div>
  )
}

