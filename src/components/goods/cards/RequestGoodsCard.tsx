
import React from 'react';
import { GoodsExchangeItem } from '@/types/localTypes';
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import BaseGoodsCard from './BaseGoodsCard';

interface RequestGoodsCardProps {
  request: GoodsExchangeItem;
  getUrgencyClass: (urgency: string) => string;
  getUrgencyLabel: (urgency: string) => string;
  onSelect: () => void;
}

const RequestGoodsCard: React.FC<RequestGoodsCardProps> = ({
  request,
  getUrgencyClass,
  getUrgencyLabel,
  onSelect
}) => {
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

        {/* Action buttons */}
        <div className="flex items-center">
          <Button 
            variant="ghost"
            size="sm"
            className="hover:bg-gray-100"
          >
            View Details
          </Button>
        </div>
      </div>

      {/* Urgency badge - contained within the card */}
      {request.urgency && (
        <div className="absolute top-2 right-2">
          <Badge className={getUrgencyClass(request.urgency)}>
            {getUrgencyLabel(request.urgency)}
          </Badge>
        </div>
      )}
    </BaseGoodsCard>
  );
};

export default RequestGoodsCard;

