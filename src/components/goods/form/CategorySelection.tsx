
// This component handles category selection for goods form using a dropdown select
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { GoodsItemCategory } from "@/components/support/types/formTypes";

// Import category names from constants
import { CATEGORY_NAMES } from "../utils/goodsConstants";

// Component props definition
interface CategorySelectionProps {
  category?: GoodsItemCategory;
  onChange: (category: GoodsItemCategory) => void;
}

/**
 * CategorySelection component for Goods form
 * 
 * This component renders a dropdown select for choosing item categories
 * with all available categories in a simple dropdown menu.
 */
const CategorySelection = ({ category, onChange }: CategorySelectionProps) => {
  // If no category is selected, default to 'furniture'
  const selectedCategory = category || "furniture";

  return (
    <div className="space-y-2">
      <Label htmlFor="category">Item Category</Label>
      <Select 
        value={selectedCategory}  
        onValueChange={(value) => onChange(value as GoodsItemCategory)}
      >
        <SelectTrigger className="w-full">
          <SelectValue placeholder="Select a category" />
        </SelectTrigger>
        <SelectContent>
          {Object.entries(CATEGORY_NAMES).map(([value, label]) => (
            <SelectItem key={value} value={value}>
              {label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};

export default CategorySelection;
