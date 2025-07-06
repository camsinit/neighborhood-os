import React from 'react';
import { GoodsExchangeItem } from '@/types/localTypes';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import BaseGoodsCard from './BaseGoodsCard';
import { useNavigate } from "react-router-dom";
import { createItemNavigationService } from "@/services/navigation/ItemNavigationService";

interface RequestGoodsCardProps {
  request: GoodsExchangeItem;
  onSelect: (item: GoodsExchangeItem) => void; // Pass full item data
}

/**
 * RequestGoodsCard - Compact card component for goods requests
 * 
 * Updated to use a more compact height (h-48 instead of h-64) to minimize
 * empty space while maintaining the "I can help!" button visibility.
 */
const RequestGoodsCard: React.FC<RequestGoodsCardProps> = ({
  request,
  onSelect
}) => {
  const navigate = useNavigate();
  
  const handleCardClick = () => {
    // Use navigation service to open sheet via URL
    const navigationService = createItemNavigationService(navigate);
    navigationService.navigateToItem('goods', request.id, { 
      showToast: false 
    });
  };
  
  const handleHelpClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onSelect(request); // Keep the help action separate
  };

  return (
    <BaseGoodsCard 
      item={request}
      onClick={handleCardClick}
      className="w-64 h-48"
    >
      {/* Dotted "I can help!" section at the top - reduced height */}
      <div className="w-full h-24 flex-shrink-0 bg-gray-50 border-2 border-dashed border-gray-300 flex items-center justify-center">
        <Button 
          className="bg-orange-500 hover:bg-orange-600 text-white text-sm px-4 py-2"
          onClick={handleHelpClick}
        >
          I can help!
        </Button>
      </div>
      
      {/* Content section - more compact */}
      <div className="flex-1 flex flex-col justify-between p-3">
        {/* Main content */}
        <div className="flex-1">
          {/* Title with profile picture - single line with truncation */}
          <div className="flex items-center gap-2 mb-2">
            <Avatar className="h-4 w-4 flex-shrink-0">
              <AvatarImage src={request.profiles?.avatar_url || undefined} />
              <AvatarFallback className="text-xs">
                {request.profiles?.display_name?.[0] || '?'}
              </AvatarFallback>
            </Avatar>
            <h3 className="text-sm font-semibold text-gray-900 truncate flex-1">
              {request.title}
            </h3>
          </div>
          
          {/* Description preview - limited to 2 lines */}
          {request.description && (
            <p className="text-xs text-gray-600 line-clamp-2">
              {request.description}
            </p>
          )}
        </div>
      </div>
    </BaseGoodsCard>
  );
};

export default RequestGoodsCard;