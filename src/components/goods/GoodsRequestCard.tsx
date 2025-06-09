
import React from 'react';
import { GoodsExchangeItem } from '@/types/localTypes';
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import RequestDetailCard from './components/RequestDetailCard';
import RequestGoodsCard from './cards/RequestGoodsCard';
import { useUser } from '@supabase/auth-helpers-react';

interface GoodsRequestCardProps {
  request: GoodsExchangeItem;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onDeleteItem?: (item: GoodsExchangeItem) => Promise<void>;
  isDeletingItem?: boolean;
}

/**
 * GoodsRequestCard - Card component for goods requests
 * 
 * Updated to use the new marketplace-style RequestGoodsCard component
 * and include ownership checking and proper prop passing.
 */
const GoodsRequestCard: React.FC<GoodsRequestCardProps> = ({
  request,
  isOpen,
  onOpenChange,
  onDeleteItem,
  isDeletingItem = false
}) => {
  // Get current user to check ownership
  const user = useUser();
  
  // Function to check if current user owns the item
  const isOwner = user?.id === request.user_id;

  // Handle edit function - only allow if user owns the item
  const handleEdit = () => {
    if (isOwner) {
      // Edit functionality would be handled by parent component
      console.log('Edit requested for item:', request.id);
    }
  };

  return (
    <Popover open={isOpen} onOpenChange={onOpenChange}>
      <PopoverTrigger asChild>
        <div className="w-full">
          <RequestGoodsCard
            request={request}
            onSelect={() => onOpenChange(true)}
          />
        </div>
      </PopoverTrigger>
      
      <PopoverContent className="w-[300px] p-0" sideOffset={5}>
        <RequestDetailCard
          request={request}
          onDeleteItem={onDeleteItem}
          isDeletingItem={isDeletingItem}
          onEdit={handleEdit}
          isOwner={isOwner}
        />
      </PopoverContent>
    </Popover>
  );
};

export default GoodsRequestCard;
