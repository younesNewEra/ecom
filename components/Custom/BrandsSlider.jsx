'use client'
import React, { useState, useEffect, useRef } from 'react';
const BrandSlider = () => {
  // Brand data
  const clothingBrands = [
    { id: 1, name: 'Nike', logo: '/nike.svg' },
    { id: 2, name: 'Adidas', logo: '/adidas.svg' },
    { id: 3, name: 'Zara', logo: '/zara.svg' },
    { id: 4, name: 'Under Armor', logo: '/underArmor.svg' },
    { id: 5, name: 'Puma', logo: '/puma.svg' },
  ];

  // Clone the brands array to create the infinite loop effect
  const allBrands = [...clothingBrands, ...clothingBrands, ...clothingBrands];
  
  const sliderRef = useRef(null);
  const [sliderWidth, setSliderWidth] = useState(0);
  const [scrollPosition, setScrollPosition] = useState(0);
  const scrollSpeed = 1; // Pixels per frame

  // Initialize and handle resizing
  useEffect(() => {
    const updateWidth = () => {
      if (sliderRef.current) {
        setSliderWidth(sliderRef.current.scrollWidth / 3);
      }
    };
    
    updateWidth();
    window.addEventListener('resize', updateWidth);
    
    return () => window.removeEventListener('resize', updateWidth);
  }, []);

  // Animation loop
  useEffect(() => {
    const animate = () => {
      setScrollPosition(prevPos => {
        // Reset position when we've scrolled through one full set of brands
        if (prevPos >= sliderWidth) {
          return 0;
        }
        return prevPos + scrollSpeed;
      });
    };
    
    const animationId = requestAnimationFrame(function loop() {
      animate();
      requestAnimationFrame(loop);
    });
    
    return () => cancelAnimationFrame(animationId);
  }, [sliderWidth]);

  return (
    <div className="w-full overflow-hidden bg-gray-50 py-8">
      <div className="mx-auto">
        <h2 className="text-2xl font-bold text-center mb-6">Our Partners</h2>
        <div className="relative overflow-hidden">
          <div 
            ref={sliderRef}
            className="flex items-center"
            style={{ 
              transform: `translateX(-${scrollPosition}px)`,
            }}
          >
            {allBrands.map((brand, index) => (
              <div 
                key={`${brand.id}-${index}`} 
                className="flex flex-col items-center justify-center mx-8 min-w-32"
              >
                <div className="h-16 w-16 flex items-center justify-center bg-white rounded-full shadow-sm p-2">
                  <img 
                    src={brand.logo} 
                    alt={`${brand.name} logo`} 
                    className="max-h-full max-w-full object-contain"
                  />
                </div>
                <p className="mt-2 text-sm font-medium text-gray-800">{brand.name}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default BrandSlider;