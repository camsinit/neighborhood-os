
import React from 'react';
import { GoodsExchangeItem } from '@/types/localTypes';
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import RequestDetailCard from './components/RequestDetailCard';
import { Button } from "@/components/ui/button"; // Import Button directly

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
        <div className="w-full flex items-center p-4 rounded-lg border border-gray-200 hover:border-gray-300 bg-white cursor-pointer relative group mb-3">
          {/* Profile and title section */}
          <div className="flex items-center gap-3 flex-grow">
            <Avatar className="h-10 w-10">
              <AvatarImage src={request.profiles?.avatar_url || undefined} />
              <AvatarFallback>
                {request.profiles?.display_name?.[0] || '?'}
              </AvatarFallback>
            </Avatar>
            <div className="flex flex-col">
              <h4 className="font-medium text-gray-900">{request.title}</h4>
              <p className="text-sm text-gray-500 line-clamp-1">
                {request.description}
              </p>
            </div>
          </div>
          
          {/* Action buttons */}
          <div className="flex gap-2 ml-4">
            <Button 
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                // Handle edit action
              }}
            >
              Edit
            </Button>
            {onDeleteItem && (
              <Button 
                variant="ghost"
                size="sm"
                className="text-red-600"
                onClick={(e) => {
                  e.stopPropagation();
                  onDeleteItem(request);
                }}
                disabled={isDeletingItem}
              >
                Delete
              </Button>
            )}
          </div>
          
          {/* Urgency badge */}
          {request.urgency && (
            <Badge 
              className={`${getUrgencyClass(request.urgency)} absolute right-2 top-1/2 transform -translate-y-1/2 group-hover:opacity-0 transition-opacity`}
            >
              {getUrgencyLabel(request.urgency)}
            </Badge>
          )}
        </div>
      </PopoverTrigger>
      
      {/* Popover content */}
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
