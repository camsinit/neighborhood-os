
import React from 'react';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Grid2X2, LayoutList } from "lucide-react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { GoodsItemCategory } from "@/components/support/types/formTypes";

/**
 * GoodsFilterBar Component
 * 
 * This component provides filtering controls for goods listings with:
 * - Search functionality
 * - Type filtering (offers/requests)
 * - Category filtering
 * - View type toggle (grid/list)
 */
interface GoodsFilterBarProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  activeTab: string;
  onTabChange: (tab: string) => void;
  selectedCategory: GoodsItemCategory | null;
  onCategoryChange: (category: GoodsItemCategory | null) => void;
  onOfferItem: () => void;
  onRequestItem: () => void;
  viewType?: 'grid' | 'list';
  onViewTypeChange?: (type: 'grid' | 'list') => void;
}

// Category configuration with colors and labels
const categoryConfig: Record<GoodsItemCategory, { color: string; bgColor: string; label: string }> = {
  furniture: { color: 'text-[#8B5CF6]', bgColor: 'bg-[#E5DEFF]', label: 'Furniture' },
  clothing: { color: 'text-[#F97316]', bgColor: 'bg-[#FDE1D3]', label: 'Clothing' },
  books: { color: 'text-emerald-600', bgColor: 'bg-[#F2FCE2]', label: 'Books' },
  electronics: { color: 'text-[#221F26]', bgColor: 'bg-[#D3E4FD]', label: 'Electronics' },
  tools: { color: 'text-[#0EA5E9]', bgColor: 'bg-[#D3EFFD]', label: 'Tools' },
  toys: { color: 'text-[#D946EF]', bgColor: 'bg-[#FFDEE2]', label: 'Toys' },
  kitchen: { color: 'text-amber-600', bgColor: 'bg-amber-50', label: 'Kitchen Items' },
  sports: { color: 'text-cyan-600', bgColor: 'bg-cyan-50', label: 'Sports' },
  garden: { color: 'text-green-600', bgColor: 'bg-green-50', label: 'Garden' },
  produce: { color: 'text-lime-600', bgColor: 'bg-lime-50', label: 'Produce' },
  household: { color: 'text-blue-600', bgColor: 'bg-blue-50', label: 'Household' },
  other: { color: 'text-gray-600', bgColor: 'bg-gray-100', label: 'Other' },
};

// Categories array for iteration
const categories: GoodsItemCategory[] = [
  'furniture',
  'clothing',
  'books',
  'electronics',
  'tools',
  'toys',
  'kitchen',
  'sports',
  'garden',
  'produce',
  'household',
  'other'
];

const GoodsFilterBar = ({
  searchQuery,
  onSearchChange,
  activeTab,
  onTabChange,
  selectedCategory,
  onCategoryChange,
  onOfferItem,
  onRequestItem,
  viewType = 'list',
  onViewTypeChange
}: GoodsFilterBarProps) => {
  // Handle category selection
  const handleCategoryClick = (category: GoodsItemCategory) => {
    // If the category is already selected, clear it. Otherwise, select it.
    onCategoryChange(selectedCategory === category ? null : category);
  };

  // Clear all filters
  const handleClearFilters = () => {
    onCategoryChange(null);
    onSearchChange('');
  };

  return (
    <div className="space-y-4">
      {/* Top row with search and actions */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-4">
          {/* Search input */}
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
          
          {/* Tabs for switching between offers and needs */}
          <Tabs value={activeTab} onValueChange={onTabChange}>
            <TabsList>
              <TabsTrigger value="offers">Available</TabsTrigger>
              <TabsTrigger value="needs">Requests</TabsTrigger>
            </TabsList>
          </Tabs>
          
          {/* View type toggle (if enabled) */}
          {onViewTypeChange && (
            <div className="flex items-center border rounded-md p-1">
              <button
                onClick={() => onViewTypeChange('grid')}
                className={cn(
                  "p-1.5 rounded", 
                  viewType === 'grid' ? "bg-gray-100" : ""
                )}
              >
                <Grid2X2 className="h-4 w-4" />
              </button>
              <button
                onClick={() => onViewTypeChange('list')}
                className={cn(
                  "p-1.5 rounded", 
                  viewType === 'list' ? "bg-gray-100" : ""
                )}
              >
                <LayoutList className="h-4 w-4" />
              </button>
            </div>
          )}
        </div>
        
        {/* Action buttons */}
        <div className="flex gap-2">
          <Button 
            onClick={onRequestItem} 
            className="bg-[#FEC6A1] hover:bg-[#FEC6A1]/90 text-gray-900"
            size="sm"
          >
            Request
          </Button>
          <Button 
            onClick={onOfferItem} 
            className="bg-[#FEC6A1] hover:bg-[#FEC6A1]/90 text-gray-900"
            size="sm"
          >
            Offer
          </Button>
        </div>
      </div>

      {/* Category filtering */}
      <div className="flex flex-wrap gap-2 items-center">
        {categories.map(category => {
          const isSelected = selectedCategory === category;
          const config = categoryConfig[category];
          
          return (
            <Badge
              key={category}
              className={cn(
                `${config.bgColor} ${config.color} cursor-pointer hover:opacity-90 border-0 transition-all`,
                isSelected && 'ring-2 ring-offset-1 ring-primary'
              )}
              onClick={() => handleCategoryClick(category)}
            >
              {config.label}
              {isSelected && (
                <span className="ml-1 inline-flex h-3 w-3 items-center justify-center rounded-full bg-primary">
                  <span className="h-1.5 w-1.5 rounded-full bg-white"></span>
                </span>
              )}
            </Badge>
          );
        })}
        
        {/* Clear filters button - only show when filters are active */}
        {(selectedCategory || searchQuery) && (
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={handleClearFilters}
            className="text-gray-500 hover:text-gray-700 h-7 py-0 px-2"
          >
            Clear Filters
          </Button>
        )}
      </div>
    </div>
  );
};

export default GoodsFilterBar;
