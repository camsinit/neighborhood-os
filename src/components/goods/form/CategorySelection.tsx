
// This component handles category selection for goods form
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { GoodsItemCategory } from "@/components/support/types/formTypes";

// Import category names from constants
import { CATEGORY_NAMES } from "../utils/goodsConstants";

// Component props definition
interface CategorySelectionProps {
  category: GoodsItemCategory;
  onChange: (category: GoodsItemCategory) => void;
}

/**
 * CategorySelection component
 * 
 * This component renders a dropdown for selecting the goods category.
 * It uses the predefined category names from constants.
 */
const CategorySelection = ({ category, onChange }: CategorySelectionProps) => {
  return (
    <div className="space-y-2">
      <Label htmlFor="category">Item Category</Label>
      <Select 
        value={category} 
        onValueChange={(value) => onChange(value as GoodsItemCategory)}
      >
        <SelectTrigger className="w-full">
          <SelectValue placeholder="Select category" />
        </SelectTrigger>
        <SelectContent>
          {/* Map through all available categories to create dropdown options */}
          {Object.entries(CATEGORY_NAMES).map(([value, label]) => (
            <SelectItem key={value} value={value}>{label}</SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};

export default CategorySelection;
