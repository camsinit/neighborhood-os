
import React from 'react';
import { GoodsExchangeItem } from '@/types/localTypes';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Edit, Trash2, MessageCircle, Calendar, MapPin } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface RequestDetailCardProps {
  request: GoodsExchangeItem;
  onDeleteItem?: (item: GoodsExchangeItem) => Promise<void>;
  isDeletingItem?: boolean;
  onEdit: () => void;
  isOwner?: boolean; // New prop to determine ownership
}

/**
 * RequestDetailCard - Detailed view of a goods exchange item
 * 
 * Updated to only show edit/delete buttons to the item owner.
 * This ensures users can only modify their own posts.
 */
const RequestDetailCard: React.FC<RequestDetailCardProps> = ({
  request,
  onDeleteItem,
  isDeletingItem = false,
  onEdit,
  isOwner = false // Default to false for safety
}) => {
  const isUrgent = request.urgency === 'high';
  
  return (
    <div className="p-4 space-y-4">
      {/* Header with user info */}
      <div className="flex items-start gap-3">
        <Avatar className="h-10 w-10">
          <AvatarImage src={request.profiles?.avatar_url || undefined} />
          <AvatarFallback>
            {request.profiles?.display_name?.[0] || '?'}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1">
          <h3 className="font-semibold text-gray-900">{request.title}</h3>
          <p className="text-sm text-gray-500">
            {request.profiles?.display_name || 'Anonymous'}
          </p>
        </div>
        {isUrgent && (
          <Badge variant="destructive" className="text-xs">
            Urgent
          </Badge>
        )}
      </div>

      {/* Description */}
      {request.description && (
        <div>
          <p className="text-sm text-gray-700">{request.description}</p>
        </div>
      )}

      {/* Image if available */}
      {(request.image_url || (request.images && request.images.length > 0)) && (
        <div className="rounded-lg overflow-hidden">
          <img 
            src={request.image_url || request.images?.[0]} 
            alt={request.title}
            className="w-full h-48 object-cover"
          />
        </div>
      )}

      {/* Metadata */}
      <div className="space-y-2 text-xs text-gray-500">
        <div className="flex items-center gap-1">
          <Calendar className="h-3 w-3" />
          <span>Posted {formatDistanceToNow(new Date(request.created_at))} ago</span>
        </div>
        
        {request.goods_category && (
          <div className="flex items-center gap-1">
            <Badge variant="outline" className="text-xs">
              {request.goods_category.charAt(0).toUpperCase() + request.goods_category.slice(1)}
            </Badge>
          </div>
        )}
      </div>

      <Separator />

      {/* Action buttons */}
      <div className="flex gap-2">
        {/* Contact button - always visible for others' items */}
        {!isOwner && (
          <Button size="sm" className="flex-1">
            <MessageCircle className="h-4 w-4 mr-1" />
            Contact
          </Button>
        )}
        
        {/* Edit and delete buttons - only visible for owner */}
        {isOwner && (
          <>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={onEdit}
              className="flex-1"
            >
              <Edit className="h-4 w-4 mr-1" />
              Edit
            </Button>
            {onDeleteItem && (
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => onDeleteItem(request)}
                disabled={isDeletingItem}
                className="flex-1 text-red-600 border-red-200 hover:bg-red-50"
              >
                <Trash2 className="h-4 w-4 mr-1" />
                {isDeletingItem ? 'Deleting...' : 'Delete'}
              </Button>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default RequestDetailCard;
