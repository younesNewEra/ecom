import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"

export default function CategoryFilter({ categories, selectedCategories, setSelectedCategories }) {
  const toggleCategory = (category) => {
    // Check if the category is selected by comparing IDs for objects
    const isSelected = selectedCategories.some(selected => 
      (typeof selected === 'object' && typeof category === 'object') 
        ? selected.id === category.id 
        : selected === category
    );
    
    if (isSelected) {
      setSelectedCategories(selectedCategories.filter(c => 
        (typeof c === 'object' && typeof category === 'object') 
          ? c.id !== category.id 
          : c !== category
      ));
    } else {
      setSelectedCategories([...selectedCategories, category]);
    }
  }

  return (
    <div>
      <h3 className="font-semibold mb-2">Categories</h3>
      <div className="space-y-2">
        {categories.map((category) => {
          // Get category ID and name safely
          const categoryId = typeof category === 'object' ? category.id : category;
          const categoryName = typeof category === 'object' ? category.name : category;
          
          // Check if this category is selected
          const isChecked = selectedCategories.some(selected => 
            (typeof selected === 'object' && typeof category === 'object') 
              ? selected.id === category.id 
              : selected === category
          );
          
          return (
            <div key={categoryId || `cat-${categoryName}`} className="flex items-center space-x-2">
              <Checkbox
                id={`category-${categoryId || categoryName}`}
                checked={isChecked}
                onCheckedChange={() => toggleCategory(category)}
              />
              <Label 
                htmlFor={`category-${categoryId || categoryName}`} 
                className="text-sm cursor-pointer"
              >
                {categoryName}
              </Label>
            </div>
          );
        })}
      </div>
    </div>
  )
}

