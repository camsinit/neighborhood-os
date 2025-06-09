
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
 * Updated to display as a square card for 3-column grid layout
 * with image at top, title, description preview, and user info at bottom
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
      className="w-full aspect-square flex flex-col rounded-lg border border-gray-200 hover:border-gray-300 bg-white cursor-pointer relative group overflow-hidden shadow-sm"
      onClick={onClick}
    >
      {/* Image section at the top */}
      <div className="w-full h-32 flex-shrink-0 bg-gray-100">
        {(item.image_url || (item.images && item.images.length > 0)) ? (
          <img 
            src={item.image_url || item.images?.[0]} 
            alt={item.title}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="h-full w-full flex items-center justify-center text-gray-400">
            <span className="text-xs">No image</span>
          </div>
        )}
      </div>
      
      {/* Content section */}
      <div className="flex-1 flex flex-col justify-between p-3">
        {/* Main content */}
        <div className="flex-1">
          {/* Title - prominently displayed */}
          <h3 className="text-sm font-semibold text-gray-900 mb-2 line-clamp-2">
            {item.title}
          </h3>
          
          {/* Description preview */}
          {item.description && (
            <p className="text-xs text-gray-600 line-clamp-2 mb-2">
              {item.description}
            </p>
          )}
        </div>
        
        {/* Bottom section with user info */}
        <div className="flex items-center justify-between mt-auto">
          <div className="flex items-center gap-2 min-w-0 flex-1">
            <Avatar className="h-5 w-5 flex-shrink-0">
              <AvatarImage src={item.profiles?.avatar_url || undefined} />
              <AvatarFallback className="text-xs">
                {item.profiles?.display_name?.[0] || '?'}
              </AvatarFallback>
            </Avatar>
            <span className="text-xs text-gray-500 truncate">
              {item.profiles?.display_name || 'Anonymous'}
            </span>
          </div>
          
          {/* Edit and Delete buttons - only show for item owner */}
          {isOwner && (
            <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
              <Button 
                variant="ghost"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  onEdit();
                }}
                className="h-6 w-6 p-0"
              >
                <Edit className="h-3 w-3" />
              </Button>
              <Button 
                variant="ghost"
                size="sm"
                className="text-red-600 h-6 w-6 p-0"
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
