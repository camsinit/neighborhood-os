
import React from 'react';
import { GoodsExchangeItem } from '@/types/localTypes';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { format } from 'date-fns';
import { CalendarDays } from 'lucide-react';
import BaseGoodsCard from './BaseGoodsCard';

interface RequestGoodsCardProps {
  request: GoodsExchangeItem;
  onSelect: () => void;
}

/**
 * RequestGoodsCard - Card component for goods requests
 * 
 * Updated to match the marketplace design with title prominently displayed,
 * description preview, and user profile information
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
      className="w-full flex rounded-lg border border-gray-200 hover:border-gray-300 bg-white cursor-pointer overflow-hidden"
      onClick={onSelect}
    >
      {/* Image section (if available) */}
      {(request.image_url || (request.images && request.images.length > 0)) && (
        <div className="w-48 h-32 flex-shrink-0">
          <img 
            src={request.image_url || request.images?.[0]} 
            alt={request.title}
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
            {request.title}
          </h3>
          
          {/* Description preview */}
          {request.description && (
            <p className="text-sm text-gray-600 line-clamp-2 mb-3">
              {request.description}
            </p>
          )}
        </div>
        
        {/* Bottom section with user info and need-by date */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Avatar className="h-6 w-6">
              <AvatarImage src={request.profiles?.avatar_url || undefined} />
              <AvatarFallback className="text-xs">
                {request.profiles?.display_name?.[0] || '?'}
              </AvatarFallback>
            </Avatar>
            <span className="text-sm text-gray-500">
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
