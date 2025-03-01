
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, AlertCircle, Plus } from "lucide-react";

/**
 * Component for the search bar and action buttons in the Goods page
 * 
 * Includes search input and buttons for requesting or offering items
 */
interface GoodsSearchBarProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onRequestItem: () => void;
  onOfferItem: () => void;
}

const GoodsSearchBar = ({
  searchQuery,
  onSearchChange,
  onRequestItem,
  onOfferItem,
}: GoodsSearchBarProps) => {
  return (
    <div className="flex items-center justify-between mb-6">
      {/* Search input with icon */}
      <div className="relative w-[280px]">
        <Input
          type="text"
          placeholder="Search goods..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-10"
        />
        <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
      </div>

      {/* Action buttons */}
      <div className="flex gap-2">
        <Button 
          onClick={onRequestItem}
          className="bg-[#FEC6A1] hover:bg-[#FEC6A1]/90 text-gray-900"
        >
          <AlertCircle className="h-5 w-5 mr-2" />
          Request Item
        </Button>
        <Button 
          onClick={onOfferItem}
          className="bg-[#FEC6A1] hover:bg-[#FEC6A1]/90 text-gray-900"
        >
          <Plus className="h-5 w-5 mr-2" />
          Offer Item
        </Button>
      </div>
    </div>
  );
};

export default GoodsSearchBar;
