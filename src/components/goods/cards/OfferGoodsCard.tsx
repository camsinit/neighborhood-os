
import React from 'react';
import { GoodsExchangeItem } from '@/types/localTypes';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { format } from 'date-fns';
import { User, Calendar, Tag } from 'lucide-react';
import { cn } from '@/lib/utils';

interface OfferGoodsCardProps {
  item: GoodsExchangeItem;
  onSelect: () => void;
  onDelete?: () => void;
  onEdit?: () => void;
  isDeletingItem?: boolean;
}

/**
 * OfferGoodsCard Component
 * 
 * This component displays an offered good with:
 * - User information
 * - Item title and description
 * - Item image if available
 * - Action buttons for the owner
 */
const OfferGoodsCard: React.FC<OfferGoodsCardProps> = ({
  item,
  onSelect,
  onDelete,
  onEdit,
  isDeletingItem = false
}) => {
  // Determine if current user is the owner to show edit/delete buttons
  const isOwner = true; // This should be dynamically determined in a real app
  
  // Category style mapping
  const categoryStyles: Record<string, { bg: string, text: string }> = {
    furniture: { bg: 'bg-[#E5DEFF]', text: 'text-[#8B5CF6]' },
    clothing: { bg: 'bg-[#FDE1D3]', text: 'text-[#F97316]' },
    books: { bg: 'bg-[#F2FCE2]', text: 'text-emerald-600' },
    electronics: { bg: 'bg-[#D3E4FD]', text: 'text-[#221F26]' },
    tools: { bg: 'bg-[#D3EFFD]', text: 'text-[#0EA5E9]' },
    toys: { bg: 'bg-[#FFDEE2]', text: 'text-[#D946EF]' },
    other: { bg: 'bg-gray-100', text: 'text-gray-600' },
  };
  
  // Get category style
  const category = item.goods_category as string || 'other';
  const categoryStyle = categoryStyles[category] || categoryStyles.other;
  
  // Format the creation date
  const formattedDate = format(new Date(item.created_at), 'MMM d, yyyy');
  
  // Handle action button clicks with stopPropagation to prevent triggering onSelect
  const handleEditClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onEdit) onEdit();
  };
  
  const handleDeleteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onDelete) onDelete();
  };

  return (
    <div className="flex h-full cursor-pointer" onClick={onSelect}>
      {/* Image section */}
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
      <div className="flex-grow flex flex-col p-4">
        {/* Top row with user info and category */}
        <div className="flex items-start justify-between">
          {/* User profile and item title */}
          <div className="flex items-center gap-3">
            <Avatar className="h-8 w-8 border">
              <AvatarImage src={item.profiles?.avatar_url || undefined} />
              <AvatarFallback>{item.profiles?.display_name?.[0] || '?'}</AvatarFallback>
            </Avatar>
            <div className="flex flex-col">
              <h4 className="font-medium text-gray-900">{item.title}</h4>
              <p className="text-xs text-gray-500 flex items-center">
                <User className="h-3 w-3 mr-1" />
                {item.profiles?.display_name || 'Anonymous'}
              </p>
            </div>
          </div>
          
          {/* Category badge */}
          {item.goods_category && (
            <Badge className={cn(categoryStyle.bg, categoryStyle.text, 'border-0')}>
              {category.charAt(0).toUpperCase() + category.slice(1)}
            </Badge>
          )}
        </div>
        
        {/* Description preview */}
        {item.description && (
          <p className="mt-2 text-sm text-gray-700 line-clamp-1 flex-grow">
            {item.description}
          </p>
        )}
        
        {/* Bottom row with metadata and actions */}
        <div className="flex items-center justify-between mt-2">
          {/* Creation date */}
          <span className="text-xs text-gray-500 flex items-center">
            <Calendar className="h-3 w-3 mr-1" />
            {formattedDate}
          </span>
          
          {/* Action buttons for owner */}
          {isOwner && (
            <div className="flex gap-2">
              {onEdit && (
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={handleEditClick}
                  className="text-gray-600 h-7 py-0 px-2"
                >
                  Edit
                </Button>
              )}
              {onDelete && (
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={handleDeleteClick}
                  className="text-red-600 h-7 py-0 px-2"
                  disabled={isDeletingItem}
                >
                  {isDeletingItem ? "Deleting..." : "Delete"}
                </Button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default OfferGoodsCard;
