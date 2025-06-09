
import React from 'react';
import { GoodsExchangeItem } from '@/types/localTypes';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { format } from 'date-fns';
import { CalendarDays } from 'lucide-react';

interface RequestGoodsCardProps {
  request: GoodsExchangeItem;
  onSelect: () => void;
}

/**
 * RequestGoodsCard - Card component for goods requests
 * 
 * Updated to display as a square card for 3-column grid layout
 * with image at top, title with profile picture, description preview, and need-by date
 */
const RequestGoodsCard: React.FC<RequestGoodsCardProps> = ({
  request,
  onSelect
}) => {
  // Format the valid_until date if it exists
  const formattedDate = request.valid_until 
    ? format(new Date(request.valid_until), 'MMM d, yyyy')
    : null;

  return (
    <div 
      className="w-full aspect-square flex flex-col rounded-lg border border-gray-200 hover:border-gray-300 bg-white cursor-pointer overflow-hidden shadow-sm"
      onClick={onSelect}
    >
      {/* Image section at the top */}
      <div className="w-full h-32 flex-shrink-0 bg-gray-100">
        {(request.image_url || (request.images && request.images.length > 0)) ? (
          <img 
            src={request.image_url || request.images?.[0]} 
            alt={request.title}
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
            <p className="text-xs text-gray-600 line-clamp-2 mb-2">
              {request.description}
            </p>
          )}
        </div>
        
        {/* Bottom section with need-by date */}
        <div className="mt-auto">
          {/* Need By Date */}
          {formattedDate && (
            <div className="flex items-center gap-1 text-xs text-gray-600">
              <CalendarDays className="h-3 w-3" />
              <span>Need by {formattedDate}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default RequestGoodsCard;
