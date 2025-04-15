
// This component handles category selection for goods form using a button group
import { useState } from "react";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { GoodsItemCategory } from "@/components/support/types/formTypes";
import { ChevronDown, ChevronUp } from "lucide-react"; 

// Import category names and icons from Lucide
import { CATEGORY_NAMES } from "../utils/goodsConstants";
import { 
  Sofa, 
  Wrench, 
  Laptop, 
  Utensils, 
  Shirt, 
  BookOpen, 
  Gamepad, 
  Bike, 
  Flower2, 
  Apple, 
  Home, 
  Package 
} from "lucide-react";

// Map categories to their respective icons
const categoryIcons = {
  furniture: Sofa,
  tools: Wrench,
  electronics: Laptop,
  kitchen: Utensils,
  clothing: Shirt,
  books: BookOpen,
  toys: Gamepad,
  sports: Bike,
  garden: Flower2,
  produce: Apple,
  household: Home,
  other: Package
};

// Component props definition
interface CategorySelectionProps {
  category?: GoodsItemCategory;
  onChange: (category: GoodsItemCategory) => void;
}

const CategorySelection = ({ category, onChange }: CategorySelectionProps) => {
  // State to track whether all categories are visible
  const [showAllCategories, setShowAllCategories] = useState(false);

  // Get all category entries
  const allCategories = Object.entries(CATEGORY_NAMES);
  
  // Calculate how many categories to show initially (half rounded down)
  const initialCategories = Math.floor(allCategories.length / 2);
  
  // Get the categories to display based on showAllCategories state
  const displayedCategories = showAllCategories 
    ? allCategories 
    : allCategories.slice(0, initialCategories);

  return (
    <div className="space-y-4">
      <Label htmlFor="category">Item Category</Label>
      <ToggleGroup 
        type="single" 
        value={category || ""}  
        onValueChange={(value) => value && onChange(value as GoodsItemCategory)}
        className="flex flex-wrap gap-4 max-w-[800px]"
      >
        {displayedCategories.map(([value, label]) => {
          const IconComponent = categoryIcons[value as keyof typeof categoryIcons];
          return (
            <ToggleGroupItem
              key={value}
              value={value}
              aria-label={label}
              className="flex-1 min-w-[140px] items-center gap-2 px-4 py-3 rounded-full border border-gray-200 
                bg-blue-50/80 text-gray-700 hover:bg-blue-100/80 transition-colors
                data-[state=on]:bg-primary data-[state=on]:text-primary-foreground data-[state=on]:border-primary"
            >
              <IconComponent className="h-4 w-4" />
              <span>{label}</span>
            </ToggleGroupItem>
          );
        })}
      </ToggleGroup>
      
      {/* View all categories button */}
      <Button
        type="button"
        variant="outline"
        onClick={() => setShowAllCategories(!showAllCategories)}
        className="w-full mt-2"
      >
        {showAllCategories ? (
          <>
            Show Less Categories <ChevronUp className="ml-2 h-4 w-4" />
          </>
        ) : (
          <>
            View All Categories <ChevronDown className="ml-2 h-4 w-4" />
          </>
        )}
      </Button>
    </div>
  );
};

export default CategorySelection;
