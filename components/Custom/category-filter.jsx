import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"

export default function CategoryFilter({ categories, selectedCategories, setSelectedCategories }) {
  const toggleCategory = (category) => {
    if (selectedCategories.includes(category)) {
      setSelectedCategories(selectedCategories.filter((c) => c !== category))
    } else {
      setSelectedCategories([...selectedCategories, category])
    }
  }

  return (
    <div>
      <h3 className="font-semibold mb-2">Categories</h3>
      <div className="space-y-2">
        {categories.map((category) => (
          <div key={category} className="flex items-center space-x-2">
            <Checkbox
              id={`category-${category}`}
              checked={selectedCategories.includes(category)}
              onCheckedChange={() => toggleCategory(category)}
            />
            <Label htmlFor={`category-${category}`} className="text-sm cursor-pointer">
              {category}
            </Label>
          </div>
        ))}
      </div>
    </div>
  )
}

