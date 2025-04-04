"use client"

import { useState, useEffect } from "react"
import { formatCurrency } from "@/lib/utils"
import { Slider } from "@/components/ui/slider"

export default function PriceFilter({ priceRange, setPriceRange }) {
  const [localRange, setLocalRange] = useState(priceRange)
  const maxPrice = 1000
  
  // Update price range with minimal delay
  useEffect(() => {
    const timer = setTimeout(() => {
      setPriceRange(localRange)
    }, 100)
    
    return () => clearTimeout(timer)
  }, [localRange, setPriceRange])
  
  return (
    <div>
      <h3 className="font-semibold mb-2">Price Range</h3>
      <div className="space-y-4">
        <div className="flex justify-between">
          <span>{formatCurrency(localRange[0])}</span>
          <span>{formatCurrency(localRange[1])}</span>
        </div>
        
        <div className="pt-4">
          <Slider
            defaultValue={localRange}
            value={localRange}
            min={0}
            max={maxPrice}
            step={1}
            minStepsBetweenThumbs={10}
            onValueChange={(value) => {
              setLocalRange(value)
            }}
          />
        </div>
      </div>
    </div>
  )
}