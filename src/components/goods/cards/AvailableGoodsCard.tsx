
import React from 'react';
import { GoodsExchangeItem } from '@/types/localTypes';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Edit, Trash2 } from 'lucide-react';

interface AvailableGoodsCardProps {
  item: GoodsExchangeItem;
  onEdit: () => void;
  onDelete: () => void;
  isDeletingItem: boolean;
  onClick: () => void;
  isOwner: boolean; // New prop to determine if current user owns this item
}

/**
 * AvailableGoodsCard - Card component for available goods items
 * 
 * Updated to show title prominently, description preview, and user profile image
 * in a layout similar to marketplace listings. Only shows edit/delete buttons
 * to the item owner to prevent unauthorized editing.
 */
const AvailableGoodsCard: React.FC<AvailableGoodsCardProps> = ({
  item,
  onEdit,
  onDelete,
  isDeletingItem,
  onClick,
  isOwner
}) => {
  return (
    <div 
      className="w-full flex rounded-lg border border-gray-200 hover:border-gray-300 bg-white cursor-pointer relative group overflow-hidden"
      onClick={onClick}
    >
      {/* Image section on the left */}
      {(item.image_url || (item.images && item.images.length > 0)) && (
        <div className="w-48 h-32 flex-shrink-0">
          <img 
            src={item.image_url || item.images?.[0]} 
            alt={item.title}
            className="h-full w-full object-cover"
          />
        </div>
      )}
      
      {/* Content section */}
      <div className="flex-grow flex flex-col justify-between p-4">
        {/* Main content */}
        <div className="flex-grow">
          {/* Title - prominently displayed */}
          <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-1">
            {item.title}
          </h3>
          
          {/* Description preview */}
          {item.description && (
            <p className="text-sm text-gray-600 line-clamp-2 mb-3">
              {item.description}
            </p>
          )}
        </div>
        
        {/* Bottom section with user info and location */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Avatar className="h-6 w-6">
              <AvatarImage src={item.profiles?.avatar_url || undefined} />
              <AvatarFallback className="text-xs">
                {item.profiles?.display_name?.[0] || '?'}
              </AvatarFallback>
            </Avatar>
            <span className="text-sm text-gray-500">
              {item.profiles?.display_name || 'Anonymous'}
            </span>
          </div>
          
          {/* Edit and Delete buttons - only show for item owner */}
          {isOwner && (
            <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <Button 
                variant="ghost"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  onEdit();
                }}
                className="h-8 px-2"
              >
                <Edit className="h-3 w-3" />
              </Button>
              <Button 
                variant="ghost"
                size="sm"
                className="text-red-600 h-8 px-2"
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete();
                }}
                disabled={isDeletingItem}
              >
                <Trash2 className="h-3 w-3" />
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AvailableGoodsCard;
