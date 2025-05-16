
import React, { useMemo } from 'react';
import { GoodsExchangeItem } from '@/types/localTypes';
import { useGoodsItemDeletion } from '../hooks/useGoodsItemDeletion';
import { filterBySearch } from '../utils/sectionHelpers';
import { EmptyState } from "@/components/ui/empty-state";
import { PackageSearch, CirclePlus } from "lucide-react";
import GoodsCard from '../cards/GoodsCard';
import { GoodsItemCategory } from "@/components/support/types/formTypes";
import { Skeleton } from "@/components/ui/skeleton";

/**
 * Props for the GoodsListView component
 */
interface GoodsListViewProps {
  goodsData: GoodsExchangeItem[];
  isLoading: boolean;
  searchQuery: string;
  requestType: "need" | "offer";
  selectedCategory: GoodsItemCategory | null;
  highlightedItemId: string | null;
  onRefresh: () => void;
  onItemSelect: (item: GoodsExchangeItem) => void;
}

/**
 * GoodsListView Component
 * 
 * This component handles the display of goods items in a list format,
 * with support for filtering, highlighting, and item selection.
 */
const GoodsListView = ({
  goodsData,
  isLoading,
  searchQuery,
  requestType,
  selectedCategory,
  highlightedItemId,
  onRefresh,
  onItemSelect
}: GoodsListViewProps) => {
  // Set up item deletion handler
  const { handleDeleteGoodsItem, isDeletingItem } = useGoodsItemDeletion(onRefresh);

  // Filter goods items based on search query, category, and request type
  const filteredItems = useMemo(() => {
    // First filter by request type
    let items = goodsData.filter(item => item.request_type === requestType);
    
    // Filter by search query
    items = filterBySearch(items, searchQuery);
    
    // Filter by category if selected
    if (selectedCategory) {
      items = items.filter(item => item.goods_category === selectedCategory);
    }
    
    return items;
  }, [goodsData, requestType, searchQuery, selectedCategory]);
  
  // Determine urgency sorting
  const sortedItems = useMemo(() => {
    if (requestType === 'need') {
      return [...filteredItems].sort((a, b) => {
        // Sort by urgency first (high urgency at the top)
        const urgencyOrder = { critical: 0, high: 1, medium: 2, low: 3 };
        const aUrgency = a.urgency || 'medium';
        const bUrgency = b.urgency || 'medium';
        
        if (aUrgency !== bUrgency) {
          return (urgencyOrder[aUrgency as keyof typeof urgencyOrder]) - 
                 (urgencyOrder[bUrgency as keyof typeof urgencyOrder]);
        }
        
        // Then sort by date (newest first)
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      });
    } else {
      // For offers, just sort by date (newest first)
      return [...filteredItems].sort((a, b) => 
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );
    }
  }, [filteredItems, requestType]);

  // Display loading skeletons
  if (isLoading) {
    return (
      <div className="space-y-4">
        {Array(3).fill(0).map((_, index) => (
          <div key={index} className="border rounded-lg p-4 w-full h-24 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Skeleton className="h-12 w-12 rounded" />
              <div>
                <Skeleton className="h-4 w-48 mb-2" />
                <Skeleton className="h-3 w-24" />
              </div>
            </div>
            <Skeleton className="h-8 w-20" />
          </div>
        ))}
      </div>
    );
  }

  // Display empty state if no items match the filters
  if (!sortedItems.length) {
    const isOffer = requestType === 'offer';
    const title = isOffer ? "No Items Available" : "No Requests";
    const description = isOffer 
      ? "No one is offering items that match your filters" 
      : "No one is requesting items that match your filters";
    const actionLabel = isOffer ? "Offer an Item" : "Request an Item";
    const actionFn = isOffer ? () => onItemSelect(null) : () => onItemSelect(null);
    
    return (
      <EmptyState
        icon={PackageSearch}
        title={title}
        description={description}
        actionLabel={actionLabel}
        onAction={actionFn}
      />
    );
  }

  // Display the filtered and sorted items
  return (
    <div className="space-y-4">
      {sortedItems.map((item) => (
        <GoodsCard
          key={item.id}
          item={item}
          onSelect={() => onItemSelect(item)}
          onDelete={() => handleDeleteGoodsItem(item)}
          isDeletingItem={isDeletingItem}
          isHighlighted={item.id === highlightedItemId}
        />
      ))}
    </div>
  );
};

export default GoodsListView;
