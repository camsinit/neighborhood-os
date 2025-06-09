
import React from 'react';
import { GoodsExchangeItem } from '@/types/localTypes';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

interface AvailableGoodsCardProps {
  item: GoodsExchangeItem;
  onClick: () => void;
}

/**
 * AvailableGoodsCard - Card component for available goods items
 * 
 * Updated to display as a square card for 3-column grid layout
 * with image at top, title with profile picture, and description preview.
 * Edit/delete buttons are removed and only available in the popover.
 */
const AvailableGoodsCard: React.FC<AvailableGoodsCardProps> = ({
  item,
  onClick
}) => {
  return (
    <div 
      className="w-full aspect-square flex flex-col rounded-lg border border-gray-200 hover:border-gray-300 bg-white cursor-pointer overflow-hidden shadow-sm"
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
          {/* Title with profile picture */}
          <div className="flex items-center gap-2 mb-2">
            <Avatar className="h-4 w-4 flex-shrink-0">
              <AvatarImage src={item.profiles?.avatar_url || undefined} />
              <AvatarFallback className="text-xs">
                {item.profiles?.display_name?.[0] || '?'}
              </AvatarFallback>
            </Avatar>
            <h3 className="text-sm font-semibold text-gray-900 line-clamp-2 flex-1">
              {item.title}
            </h3>
          </div>
          
          {/* Description preview */}
          {item.description && (
            <p className="text-xs text-gray-600 line-clamp-2 mb-2">
              {item.description}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default AvailableGoodsCard;
