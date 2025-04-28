
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search } from "lucide-react";
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

          <Tabs value={activeTab} onValueChange={onTabChange}>
            <TabsList>
              <TabsTrigger value="offers">Available</TabsTrigger>
              <TabsTrigger value="needs">Requests</TabsTrigger>
            </TabsList>
          </Tabs>
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
