
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search } from "lucide-react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

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

        <TabsList>
          <TabsTrigger value="needs" onClick={() => onTabChange("needs")}>Requests</TabsTrigger>
          <TabsTrigger value="offers" onClick={() => onTabChange("offers")}>Available</TabsTrigger>
        </TabsList>
      </div>
      
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
