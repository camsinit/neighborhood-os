import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, AlertCircle, Plus } from "lucide-react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface GoodsSearchBarProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onRequestItem: () => void;
  onOfferItem: () => void;
  activeTab: string;
  onTabChange: (tab: string) => void;
}

/**
 * GoodsSearchBar component
 * 
 * This component provides search and action functionality for the Goods Exchange page.
 * It contains:
 * - Search bar for filtering items by text
 * - Tabs for switching between different views (All/Requests/Available)
 * - Action buttons for requesting and offering items
 */
const GoodsSearchBar = ({
  searchQuery,
  onSearchChange,
  onRequestItem,
  onOfferItem,
  activeTab,
  onTabChange
}: GoodsSearchBarProps) => {
  return (
    <div className="flex items-center justify-between mb-6 gap-4">
      <div className="flex items-center gap-4">
        {/* Search bar */}
        <div className="flex items-center gap-2">
          <div className="relative w-[180px]">
            <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
            <Input 
              type="text" 
              placeholder="Search stuff..." 
              value={searchQuery} 
              onChange={e => onSearchChange(e.target.value)} 
              className="pl-10" 
            />
          </div>
        </div>

        {/* Tabs */}
        <TabsList>
          <TabsTrigger value="all" onClick={() => onTabChange("all")}>All Items</TabsTrigger>
          <TabsTrigger value="needs" onClick={() => onTabChange("needs")}>Requests</TabsTrigger>
          <TabsTrigger value="offers" onClick={() => onTabChange("offers")}>Available</TabsTrigger>
        </TabsList>
      </div>
      
      {/* Action buttons */}
      <div className="flex gap-2">
        <Button 
          onClick={onRequestItem} 
          className="bg-[#FEC6A1] hover:bg-[#FEC6A1]/90 text-gray-900"
        >
          <AlertCircle className="h-4 w-4 mr-2" />
          Request
        </Button>
        <Button 
          onClick={onOfferItem} 
          className="bg-[#FEC6A1] hover:bg-[#FEC6A1]/90 text-gray-900"
        >
          <Plus className="h-4 w-4 mr-2" />
          Offer
        </Button>
      </div>
    </div>
  );
};

export default GoodsSearchBar;
