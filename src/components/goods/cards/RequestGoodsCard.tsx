
import React from 'react';
import { GoodsExchangeItem } from '@/types/localTypes';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { format } from 'date-fns';
import { CalendarDays } from 'lucide-react'; // Import the calendar icon
import BaseGoodsCard from './BaseGoodsCard';

interface RequestGoodsCardProps {
  request: GoodsExchangeItem;
  onSelect: () => void;
}

const RequestGoodsCard: React.FC<RequestGoodsCardProps> = ({
  request,
  onSelect
}) => {
  // Format the valid_until date if it exists
  const formattedDate = request.valid_until 
    ? format(new Date(request.valid_until), 'MMM d, yyyy')
    : null;

  return (
    <BaseGoodsCard onClick={onSelect}>
      {/* Main content container */}
      <div className="flex-grow flex items-center p-4 gap-4">
        {/* Avatar and content section */}
        <div className="flex items-center gap-3 flex-grow min-w-0">
          <Avatar className="h-8 w-8 flex-shrink-0">
            <AvatarImage src={request.profiles?.avatar_url || undefined} />
            <AvatarFallback>
              {request.profiles?.display_name?.[0] || '?'}
            </AvatarFallback>
          </Avatar>
          <div className="flex flex-col min-w-0">
            <h4 className="font-medium text-gray-900 truncate">{request.title}</h4>
            <p className="text-sm text-gray-500 line-clamp-1">
              {request.description}
            </p>
          </div>
        </div>

        {/* Need By Date */}
        {formattedDate && (
          <div className="flex items-center gap-1.5 text-sm text-gray-600">
            <CalendarDays className="h-4 w-4" />
            <span>Need by {formattedDate}</span>
          </div>
        )}
      </div>
    </BaseGoodsCard>
  );
};

export default RequestGoodsCard;
