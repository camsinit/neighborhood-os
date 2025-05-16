
import React from 'react';
import { GoodsExchangeItem } from '@/types/localTypes';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { format } from 'date-fns';
import { CalendarDays, User, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';

interface RequestGoodsCardProps {
  item: GoodsExchangeItem;
  onSelect: () => void;
  urgency?: string;
}

/**
 * RequestGoodsCard Component
 * 
 * This component displays a request for goods with:
 * - User information
 * - Item title and description
 * - Urgency indicator
 * - Validity period
 */
const RequestGoodsCard: React.FC<RequestGoodsCardProps> = ({
  item,
  onSelect,
  urgency
}) => {
  // Format the valid_until date if it exists
  const formattedDate = item.valid_until 
    ? format(new Date(item.valid_until), 'MMM d, yyyy')
    : null;
    
  // Define urgency styling
  const urgencyStyles: Record<string, { bg: string, text: string, label: string }> = {
    low: { bg: 'bg-blue-50', text: 'text-blue-700', label: 'Low' },
    medium: { bg: 'bg-yellow-50', text: 'text-yellow-700', label: 'Medium' },
    high: { bg: 'bg-orange-50', text: 'text-orange-700', label: 'High' },
    critical: { bg: 'bg-red-50', text: 'text-red-700', label: 'Critical' },
  };
  
  // Get urgency style based on item's urgency
  const urgencyStyle = urgency && urgencyStyles[urgency] 
    ? urgencyStyles[urgency] 
    : urgencyStyles.medium;

  return (
    <div 
      className="flex flex-col p-4 cursor-pointer relative w-full"
      onClick={onSelect}
    >
      {/* Top row with user info and urgency */}
      <div className="flex items-start justify-between w-full">
        {/* User profile and item title */}
        <div className="flex items-center gap-3">
          <Avatar className="h-10 w-10 border">
            <AvatarImage src={item.profiles?.avatar_url || undefined} />
            <AvatarFallback>{item.profiles?.display_name?.[0] || '?'}</AvatarFallback>
          </Avatar>
          <div className="flex flex-col">
            <h4 className="font-medium text-gray-900">{item.title}</h4>
            <p className="text-sm text-gray-500 flex items-center">
              <User className="h-3 w-3 mr-1" />
              {item.profiles?.display_name || 'Anonymous'}
            </p>
          </div>
        </div>
        
        {/* Urgency badge */}
        {urgency && (
          <Badge className={cn(urgencyStyle.bg, urgencyStyle.text)}>
            {urgencyStyle.label}
          </Badge>
        )}
      </div>
      
      {/* Description preview */}
      {item.description && (
        <p className="mt-2 text-sm text-gray-700 line-clamp-2">
          {item.description}
        </p>
      )}
      
      {/* Bottom row with metadata */}
      <div className="flex items-center mt-2 text-xs text-gray-500 gap-3">
        {/* Creation date */}
        <span className="flex items-center">
          <Clock className="h-3 w-3 mr-1" />
          {format(new Date(item.created_at), 'MMM d, yyyy')}
        </span>
        
        {/* Validity date if available */}
        {formattedDate && (
          <span className="flex items-center">
            <CalendarDays className="h-3 w-3 mr-1" />
            Need by {formattedDate}
          </span>
        )}
        
        {/* Category badge */}
        {item.goods_category && (
          <Badge variant="outline" className="text-xs">
            {item.goods_category.charAt(0).toUpperCase() + item.goods_category.slice(1)}
          </Badge>
        )}
      </div>
    </div>
  );
};

export default RequestGoodsCard;
