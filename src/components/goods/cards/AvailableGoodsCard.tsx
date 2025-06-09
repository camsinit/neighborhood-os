
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
 * Now includes proper ownership checking to only show edit/delete buttons
 * to the item owner. This prevents unauthorized editing of other users' posts.
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
      className="w-full flex items-stretch rounded-lg border border-gray-200 hover:border-gray-300 bg-white cursor-pointer relative group"
      onClick={onClick}
    >
      {/* Image preview on the left */}
      {(item.image_url || (item.images && item.images.length > 0)) && (
        <div className="w-32 h-full flex-shrink-0">
          <img 
            src={item.image_url || item.images?.[0]} 
            alt={item.title}
            className="h-full w-full object-cover rounded-l-lg"
          />
        </div>
      )}
      
      {/* Content section */}
      <div className="flex-grow flex items-center p-4">
        <div className="flex items-center gap-3 flex-grow">
          <Avatar className="h-10 w-10">
            <AvatarImage src={item.profiles?.avatar_url || undefined} />
            <AvatarFallback>
              {item.profiles?.display_name?.[0] || '?'}
            </AvatarFallback>
          </Avatar>
          <div className="flex flex-col">
            <h4 className="font-medium text-gray-900">{item.title}</h4>
            <p className="text-sm text-gray-500 line-clamp-1">
              {item.description}
            </p>
          </div>
        </div>
        
        {/* Edit and Delete buttons - only show for item owner */}
        {isOwner && (
          <div className="flex gap-2 ml-4">
            <Button 
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                onEdit();
              }}
              className="opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <Edit className="h-4 w-4 mr-1" />
              Edit
            </Button>
            <Button 
              variant="ghost"
              size="sm"
              className="text-red-600 opacity-0 group-hover:opacity-100 transition-opacity"
              onClick={(e) => {
                e.stopPropagation();
                onDelete();
              }}
              disabled={isDeletingItem}
            >
              <Trash2 className="h-4 w-4 mr-1" />
              Delete
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default AvailableGoodsCard;
