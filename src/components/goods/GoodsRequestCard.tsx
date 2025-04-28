
import React from 'react';
import { GoodsExchangeItem } from '@/types/localTypes';
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import RequestDetailCard from './components/RequestDetailCard';

interface GoodsRequestCardProps {
  request: GoodsExchangeItem;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  getUrgencyClass: (urgency: string) => string;
  getUrgencyLabel: (urgency: string) => string;
  onDeleteItem?: (item: GoodsExchangeItem) => Promise<void>;
  isDeletingItem?: boolean;
}

const GoodsRequestCard: React.FC<GoodsRequestCardProps> = ({
  request,
  isOpen,
  onOpenChange,
  getUrgencyClass,
  getUrgencyLabel,
  onDeleteItem,
  isDeletingItem = false
}) => {
  return (
    <Popover open={isOpen} onOpenChange={onOpenChange}>
      <PopoverTrigger asChild>
        <div className="min-h-[88px] flex items-center p-4 rounded-lg border border-gray-200 hover:border-gray-300 bg-white cursor-pointer relative mb-2">
          {/* Profile and content section */}
          <div className="flex items-center gap-3 flex-grow">
            <Avatar className="h-10 w-10 flex-shrink-0">
              <AvatarImage src={request.profiles?.avatar_url || undefined} />
              <AvatarFallback>
                {request.profiles?.display_name?.[0] || '?'}
              </AvatarFallback>
            </Avatar>
            <div className="flex flex-col flex-grow min-w-0">
              <h4 className="font-medium text-gray-900 truncate">{request.title}</h4>
              <p className="text-sm text-gray-500 line-clamp-1">
                {request.description}
              </p>
            </div>
          </div>
          
          {/* Action buttons - always visible */}
          <div className="flex gap-2 ml-4">
            <Button 
              variant="ghost"
              size="sm"
              className="hover:bg-gray-100"
            >
              View Details
            </Button>
          </div>
          
          {/* Urgency badge */}
          {request.urgency && (
            <Badge 
              className={`${getUrgencyClass(request.urgency)} absolute right-2 top-2`}
            >
              {getUrgencyLabel(request.urgency)}
            </Badge>
          )}
        </div>
      </PopoverTrigger>
      
      <PopoverContent className="w-[300px] p-0" sideOffset={5}>
        <RequestDetailCard
          request={request}
          getUrgencyClass={getUrgencyClass}
          getUrgencyLabel={getUrgencyLabel}
          onDeleteItem={onDeleteItem}
          isDeletingItem={isDeletingItem}
        />
      </PopoverContent>
    </Popover>
  );
};

export default GoodsRequestCard;
