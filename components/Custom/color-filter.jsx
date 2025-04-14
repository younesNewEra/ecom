"use client"

export default function ColorFilter({ colors, selectedColors, setSelectedColors }) {
  // Map of color names to hex values
  const colorMap = {
    red: "#ef4444",
    blue: "#3b82f6",
    green: "#10b981",
    yellow: "#f59e0b",
    purple: "#8b5cf6",
    pink: "#ec4899",
    black: "#000000",
    white: "#ffffff",
    gray: "#6b7280",
    brown: "#92400e",
  }

  const toggleColor = (color) => {
    // Check if the color is selected by comparing IDs for objects
    const isSelected = selectedColors.some(selected => 
      (typeof selected === 'object' && typeof color === 'object') 
        ? selected.id === color.id 
        : selected === color
    );
    
    if (isSelected) {
      setSelectedColors(selectedColors.filter(c => 
        (typeof c === 'object' && typeof color === 'object') 
          ? c.id !== color.id 
          : c !== color
      ));
    } else {
      setSelectedColors([...selectedColors, color]);
    }
  }

  // Helper function to get color display value
  const getColorDisplay = (color) => {
    // If color is an object with hexValue property, use that
    if (color && typeof color === 'object' && color.hexValue) {
      return color.hexValue;
    }
    
    // If color is an object with name property, use the name to look up in colorMap
    if (color && typeof color === 'object' && color.name) {
      const colorName = color.name.toLowerCase();
      return colorMap[colorName] || "#000000";
    }
    
    // If color is a string, use it directly
    if (typeof color === 'string') {
      return colorMap[color.toLowerCase()] || color;
    }
    
    // Default fallback
    return "#000000";
  }

  // Helper function to get color name for display
  const getColorName = (color) => {
    if (color && typeof color === 'object' && color.name) {
      return color.name;
    }
    return color;
  }

  // Check if a color is selected
  const isColorSelected = (color) => {
    return selectedColors.some(selected => 
      (typeof selected === 'object' && typeof color === 'object') 
        ? selected.id === color.id 
        : selected === color
    );
  }

  return (
    <div>
      <h3 className="font-semibold mb-2">Colors</h3>
      <div className="flex flex-wrap gap-2">
        {colors.map((color) => (
          <button
            key={typeof color === 'object' ? color.id : color}
            onClick={() => toggleColor(color)}
            className={`w-8 h-8 rounded-full flex items-center justify-center border-2 ${
              isColorSelected(color) ? "border-gray-900" : "border-gray-200"
            }`}
            title={getColorName(color)}
          >
            <span
              className="w-6 h-6 rounded-full"
              style={{ backgroundColor: getColorDisplay(color) }}
            ></span>
          </button>
        ))}
      </div>
    </div>
  )
}

