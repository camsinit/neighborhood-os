
// This component handles category selection for goods form using a button group
import { Label } from "@/components/ui/label";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { GoodsItemCategory } from "@/components/support/types/formTypes";

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
  category: GoodsItemCategory;
  onChange: (category: GoodsItemCategory) => void;
}

/**
 * CategorySelection component
 * 
 * This component renders a button group for selecting the goods category.
 * Each button includes an icon and label for better visual recognition.
 */
const CategorySelection = ({ category, onChange }: CategorySelectionProps) => {
  return (
    <div className="space-y-4">
      <Label htmlFor="category">Item Category</Label>
      <ToggleGroup 
        type="single" 
        value={category}
        onValueChange={(value) => onChange(value as GoodsItemCategory)}
        className="flex flex-wrap gap-4 max-w-[800px]"
      >
        {Object.entries(CATEGORY_NAMES).map(([value, label]) => {
          const IconComponent = categoryIcons[value as keyof typeof categoryIcons];
          return (
            <ToggleGroupItem
              key={value}
              value={value}
              aria-label={label}
              className="flex-1 min-w-[140px] items-center gap-2 px-4 py-3 data-[state=on]:bg-primary data-[state=on]:text-primary-foreground"
            >
              <IconComponent className="h-4 w-4" />
              <span>{label}</span>
            </ToggleGroupItem>
          );
        })}
      </ToggleGroup>
    </div>
  );
};

export default CategorySelection;
