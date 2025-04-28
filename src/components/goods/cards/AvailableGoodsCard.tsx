
import React from 'react';
import { GoodsExchangeItem } from '@/types/localTypes';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import BaseGoodsCard from './BaseGoodsCard';

interface AvailableGoodsCardProps {
  item: GoodsExchangeItem;
  onEdit: () => void;
  onDelete: () => void;
  isDeletingItem: boolean;
  onClick: () => void;
}

const AvailableGoodsCard: React.FC<AvailableGoodsCardProps> = ({
  item,
  onEdit,
  onDelete,
  isDeletingItem,
  onClick
}) => {
  const handleEditClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onEdit();
  };

  const handleDeleteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onDelete();
  };

  return (
    <BaseGoodsCard onClick={onClick}>
      {/* Image section with fixed dimensions */}
      {(item.image_url || (item.images && item.images.length > 0)) && (
        <div className="w-24 h-24 flex-shrink-0">
          <img 
            src={item.image_url || item.images?.[0]} 
            alt={item.title}
            className="h-full w-full object-cover"
          />
        </div>
      )}
      
      {/* Content section */}
      <div className="flex-grow flex items-center p-4">
        <div className="flex items-center gap-3 flex-grow min-w-0">
          <Avatar className="h-8 w-8 flex-shrink-0">
            <AvatarImage src={item.profiles?.avatar_url || undefined} />
            <AvatarFallback>
              {item.profiles?.display_name?.[0] || '?'}
            </AvatarFallback>
          </Avatar>
          <div className="flex flex-col min-w-0">
            <h4 className="font-medium text-gray-900 truncate">{item.title}</h4>
            <p className="text-sm text-gray-500 line-clamp-1">
              {item.description}
            </p>
          </div>
        </div>
        
        {/* Action buttons */}
        <div className="flex gap-2 ml-4">
          <Button 
            variant="ghost"
            size="sm"
            onClick={handleEditClick}
          >
            Edit
          </Button>
          <Button 
            variant="ghost"
            size="sm"
            className="text-red-600"
            onClick={handleDeleteClick}
            disabled={isDeletingItem}
          >
            Delete
          </Button>
        </div>
      </div>
    </BaseGoodsCard>
  );
};

export default AvailableGoodsCard;

