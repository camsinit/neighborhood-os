import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, AlertCircle, Plus, Filter } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { CATEGORY_NAMES } from "./utils/goodsConstants";
import { GoodsItemCategory } from "@/components/support/types/formTypes";

/**
 * Component for the search bar and action buttons in the Goods page
 * 
 * Includes search input, filter, and buttons for requesting or offering items
 */
interface GoodsSearchBarProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onRequestItem: () => void;
  onOfferItem: () => void;
  onCategoryFilter?: (categories: GoodsItemCategory[]) => void;
}
const GoodsSearchBar = ({
  searchQuery,
  onSearchChange,
  onRequestItem,
  onOfferItem,
  onCategoryFilter
}: GoodsSearchBarProps) => {
  // State to track which categories are selected in the filter
  const [selectedCategories, setSelectedCategories] = useState<GoodsItemCategory[]>([]);

  // Handle category selection/deselection
  const toggleCategory = (category: GoodsItemCategory) => {
    setSelectedCategories(prev => {
      // If category is already selected, remove it
      if (prev.includes(category)) {
        const newCategories = prev.filter(c => c !== category);
        // Call the filter callback with updated categories
        if (onCategoryFilter) onCategoryFilter(newCategories);
        return newCategories;
      }
      // Otherwise add it
      else {
        const newCategories = [...prev, category];
        // Call the filter callback with updated categories
        if (onCategoryFilter) onCategoryFilter(newCategories);
        return newCategories;
      }
    });
  };

  // Clear all selected filters
  const clearFilters = () => {
    setSelectedCategories([]);
    if (onCategoryFilter) onCategoryFilter([]);
  };
  return <div className="flex items-center justify-between mb-6">
      {/* Search input with icon and filter button */}
      <div className="flex items-center gap-2">
        <div className="relative w-[280px]">
          <Input type="text" placeholder="Search goods..." value={searchQuery} onChange={e => onSearchChange(e.target.value)} className="pl-10" />
          <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
        </div>
        
        {/* Filter button with popover - moved next to search bar */}
        <Popover>
          <PopoverTrigger asChild>
            
          </PopoverTrigger>
          <PopoverContent className="w-64 p-4">
            <div className="space-y-4">
              <h4 className="font-medium">Filter by Category</h4>
              
              {/* Category checkboxes */}
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {Object.entries(CATEGORY_NAMES).map(([value, label]) => <div key={value} className="flex items-center space-x-2">
                    <Checkbox id={`cat-${value}`} checked={selectedCategories.includes(value as GoodsItemCategory)} onCheckedChange={() => toggleCategory(value as GoodsItemCategory)} />
                    <Label htmlFor={`cat-${value}`} className="text-sm cursor-pointer">
                      {label}
                    </Label>
                  </div>)}
              </div>
              
              {/* Clear filters button */}
              {selectedCategories.length > 0 && <Button variant="ghost" size="sm" className="text-xs w-full" onClick={clearFilters}>
                  Clear Filters
                </Button>}
            </div>
          </PopoverContent>
        </Popover>
      </div>
      
      {/* Action buttons */}
      <div className="flex gap-2">
        {/* Request Item button */}
        <Button onClick={onRequestItem} className="bg-[#FEC6A1] hover:bg-[#FEC6A1]/90 text-gray-900">
          <AlertCircle className="h-5 w-5 mr-2" />
          Request Item
        </Button>
        
        {/* Offer Item button */}
        <Button onClick={onOfferItem} className="bg-[#FEC6A1] hover:bg-[#FEC6A1]/90 text-gray-900">
          <Plus className="h-5 w-5 mr-2" />
          Offer Item
        </Button>
      </div>
    </div>;
};
export default GoodsSearchBar;