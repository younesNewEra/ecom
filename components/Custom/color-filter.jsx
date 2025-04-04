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
    if (selectedColors.includes(color)) {
      setSelectedColors(selectedColors.filter((c) => c !== color))
    } else {
      setSelectedColors([...selectedColors, color])
    }
  }

  return (
    <div>
      <h3 className="font-semibold mb-2">Colors</h3>
      <div className="flex flex-wrap gap-2">
        {colors.map((color) => (
          <button
            key={color}
            onClick={() => toggleColor(color)}
            className={`w-8 h-8 rounded-full flex items-center justify-center border-2 ${
              selectedColors.includes(color) ? "border-gray-900" : "border-gray-200"
            }`}
            title={color}
          >
            <span
              className="w-6 h-6 rounded-full"
              style={{ backgroundColor: colorMap[color.toLowerCase()] || color }}
            ></span>
          </button>
        ))}
      </div>
    </div>
  )
}

