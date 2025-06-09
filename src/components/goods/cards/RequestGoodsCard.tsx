
import React from 'react';
import { GoodsExchangeItem } from '@/types/localTypes';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";

interface RequestGoodsCardProps {
  request: GoodsExchangeItem;
  onSelect: () => void;
}

/**
 * RequestGoodsCard - Card component for goods requests
 * 
 * Updated to display as a square card for 3-column grid layout
 * with a dotted "I can help!" section instead of image, and title with profile picture
 */
const RequestGoodsCard: React.FC<RequestGoodsCardProps> = ({
  request,
  onSelect
}) => {
  return (
    <div 
      className="w-full aspect-square flex flex-col rounded-lg border border-gray-200 hover:border-gray-300 bg-white cursor-pointer overflow-hidden shadow-sm"
      onClick={onSelect}
    >
      {/* Dotted "I can help!" section at the top */}
      <div className="w-full h-32 flex-shrink-0 bg-gray-50 border-2 border-dashed border-gray-300 flex items-center justify-center">
        <Button 
          className="bg-orange-500 hover:bg-orange-600 text-white text-sm px-4 py-2"
          onClick={(e) => {
            e.stopPropagation();
            onSelect();
          }}
        >
          I can help!
        </Button>
      </div>
      
      {/* Content section */}
      <div className="flex-1 flex flex-col justify-between p-3">
        {/* Main content */}
        <div className="flex-1">
          {/* Title with profile picture */}
          <div className="flex items-center gap-2 mb-2">
            <Avatar className="h-4 w-4 flex-shrink-0">
              <AvatarImage src={request.profiles?.avatar_url || undefined} />
              <AvatarFallback className="text-xs">
                {request.profiles?.display_name?.[0] || '?'}
              </AvatarFallback>
            </Avatar>
            <h3 className="text-sm font-semibold text-gray-900 line-clamp-2 flex-1">
              {request.title}
            </h3>
          </div>
          
          {/* Description preview */}
          {request.description && (
            <p className="text-xs text-gray-600 line-clamp-3">
              {request.description}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default RequestGoodsCard;
