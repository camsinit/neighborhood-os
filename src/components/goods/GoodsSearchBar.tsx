
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search } from "lucide-react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

/**
 * GoodsSearchBar Component
 * 
 * This component provides the search and filter functionality at the top of the Goods page,
 * including search input and tabs for switching between Available items and Requests.
 * 
 * @param searchQuery - The current search text
 * @param onSearchChange - Function to update search text
 * @param onRequestItem - Function to trigger request item dialog
 * @param onOfferItem - Function to trigger offer item dialog
 * @param activeTab - Currently selected tab ('offers' or 'needs')
 * @param onTabChange - Function to handle tab changes
 */
interface GoodsSearchBarProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onRequestItem: () => void;
  onOfferItem: () => void;
  activeTab: string;
  onTabChange: (tab: string) => void;
}

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
        <div className="flex items-center gap-2">
          {/* Search input with icon */}
          <div className="relative w-[180px]">
            <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
            <Input 
              type="text" 
              placeholder="Search..." 
              value={searchQuery} 
              onChange={e => onSearchChange(e.target.value)} 
              className="pl-10" 
            />
          </div>
        </div>

        {/* IMPORTANT: We need to wrap TabsList within a Tabs component */}
        <Tabs value={activeTab} onValueChange={onTabChange}>
          <TabsList>
            <TabsTrigger value="offers">Available</TabsTrigger>
            <TabsTrigger value="needs">Requests</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>
      
      {/* Action buttons */}
      <div className="flex gap-2">
        <Button 
          onClick={onRequestItem} 
          className="bg-[#FEC6A1] hover:bg-[#FEC6A1]/90 text-gray-900"
        >
          Request
        </Button>
        <Button 
          onClick={onOfferItem} 
          className="bg-[#FEC6A1] hover:bg-[#FEC6A1]/90 text-gray-900"
        >
          Offer
        </Button>
      </div>
    </div>
  );
};

export default GoodsSearchBar;
