
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Package, Gift } from "lucide-react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import AvailableItemsSection from './AvailableItemsSection';
import { GoodsExchangeItem } from '@/types/localTypes';

interface GoodsSearchBarProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onRequestItem: () => void;
  onOfferItem: () => void;
  activeTab: string;
  onTabChange: (tab: string) => void;
  goodsItems?: GoodsExchangeItem[];
  onDeleteItem?: (item: GoodsExchangeItem) => Promise<void>;
  isDeletingItem?: boolean;
  onRefetch: () => void;
}

/**
 * GoodsSearchBar - Search and navigation component for the goods exchange
 * 
 * This component provides search functionality, tab navigation between offers and requests,
 * and action buttons for creating new requests or offers. The buttons now use a brighter
 * orange color (orange-500) for better contrast with white text and include icons.
 */
const GoodsSearchBar = ({
  searchQuery,
  onSearchChange,
  onRequestItem,
  onOfferItem,
  activeTab,
  onTabChange,
  goodsItems = [],
  onDeleteItem,
  isDeletingItem,
  onRefetch
}: GoodsSearchBarProps) => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          {/* Search input with magnifying glass icon */}
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

          {/* Tab navigation for switching between Available and Requests */}
          <Tabs value={activeTab} onValueChange={onTabChange}>
            <TabsList>
              <TabsTrigger value="offers">Available</TabsTrigger>
              <TabsTrigger value="needs">Requests</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
        
        {/* Action buttons with brighter orange background and icons */}
        <div className="flex gap-2">
          <Button 
            onClick={onRequestItem} 
            className="bg-orange-500 hover:bg-orange-600 text-white flex items-center gap-1.5"
          >
            <Package className="h-4 w-4" />
            Request
          </Button>
          <Button 
            onClick={onOfferItem} 
            className="bg-orange-500 hover:bg-orange-600 text-white flex items-center gap-1.5"
          >
            <Gift className="h-4 w-4" />
            Offer
          </Button>
        </div>
      </div>

      {/* Conditional rendering of available items section */}
      {activeTab === 'offers' && (
        <AvailableItemsSection
          goodsItems={goodsItems}
          onDeleteItem={onDeleteItem}
          isDeletingItem={isDeletingItem}
          onRefetch={onRefetch}
        />
      )}
    </div>
  );
};

export default GoodsSearchBar;
