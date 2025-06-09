
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
 * with image at top, title, description preview, and user info at bottom
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
          {/* Title - prominently displayed */}
          <h3 className="text-sm font-semibold text-gray-900 mb-2 line-clamp-2">
            {request.title}
          </h3>
          
          {/* Description preview */}
          {request.description && (
            <p className="text-xs text-gray-600 line-clamp-2 mb-2">
              {request.description}
            </p>
          )}
        </div>
        
        {/* Bottom section with user info and need-by date */}
        <div className="flex flex-col gap-2 mt-auto">
          <div className="flex items-center gap-2">
            <Avatar className="h-5 w-5 flex-shrink-0">
              <AvatarImage src={request.profiles?.avatar_url || undefined} />
              <AvatarFallback className="text-xs">
                {request.profiles?.display_name?.[0] || '?'}
              </AvatarFallback>
            </Avatar>
            <span className="text-xs text-gray-500 truncate">
              {request.profiles?.display_name || 'Anonymous'}
            </span>
          </div>

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
