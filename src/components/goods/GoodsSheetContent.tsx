import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { User, Calendar, MapPin, Package, MessageSquare } from "lucide-react";
import { format } from "date-fns";
import { GoodsExchangeItem } from '@/types/localTypes';
import ShareButton from "@/components/ui/share-button";
import { useUser } from '@supabase/auth-helpers-react';

/**
 * GoodsSheetContent - Side panel component for displaying detailed goods item information
 * 
 * This component shows comprehensive details about a goods exchange item including:
 * - Item details (title, description, category, urgency)
 * - Provider/requester information with avatar
 * - Contact actions and sharing functionality
 * - Date information and validity period
 */
interface GoodsSheetContentProps {
  item: GoodsExchangeItem;
  onOpenChange?: (open: boolean) => void;
}

const GoodsSheetContent = ({ item, onOpenChange }: GoodsSheetContentProps) => {
  const user = useUser();
  const isOwner = user?.id === item.user_id;

  // Function to close the sheet
  const handleSheetClose = () => {
    if (onOpenChange) {
      onOpenChange(false);
    }
  };

  // Get urgency styling
  const getUrgencyStyle = (urgency?: string) => {
    switch (urgency) {
      case 'high':
        return { bg: 'bg-red-100', text: 'text-red-800', border: 'border-red-200' };
      case 'medium':
        return { bg: 'bg-yellow-100', text: 'text-yellow-800', border: 'border-yellow-200' };
      case 'low':
        return { bg: 'bg-green-100', text: 'text-green-800', border: 'border-green-200' };
      default:
        return { bg: 'bg-gray-100', text: 'text-gray-800', border: 'border-gray-200' };
    }
  };

  const urgencyStyle = getUrgencyStyle(item.urgency);

  return (
    <SheetContent className="sm:max-w-md overflow-y-auto">
      <SheetHeader className="mb-4">
        <SheetTitle className="text-xl font-bold flex justify-between items-start">
          <span>{item.title}</span>
          <div className="flex items-center gap-2">
            <ShareButton
              contentType="goods"
              contentId={item.id}
              neighborhoodId={item.neighborhood_id}
              size="sm"
              variant="ghost"
            />
          </div>
        </SheetTitle>
      </SheetHeader>

      <div className="space-y-6">
        {/* Item Type and Urgency */}
        <div className="flex gap-2 flex-wrap">
          <Badge variant={item.request_type === 'offer' ? 'default' : 'secondary'}>
            {item.request_type === 'offer' ? 'Available' : 'Needed'}
          </Badge>
          {item.urgency && (
            <Badge className={`${urgencyStyle.bg} ${urgencyStyle.text}`}>
              {item.urgency === 'high' ? 'Urgent' : item.urgency}
            </Badge>
          )}
          {item.goods_category && (
            <Badge variant="outline">
              {item.goods_category}
            </Badge>
          )}
        </div>

        {/* Provider/Requester Information */}
        <div className="flex items-start gap-3 p-3 rounded-lg bg-gray-50">
          <Avatar className="h-12 w-12">
            <AvatarImage src={item.profiles?.avatar_url || undefined} />
            <AvatarFallback>
              <User className="h-6 w-6" />
            </AvatarFallback>
          </Avatar>
          
          <div className="flex-1">
            <h4 className="font-medium text-gray-900">
              {item.profiles?.display_name || 'Anonymous'}
              {isOwner && <span className="text-sm text-gray-500 font-normal"> (You)</span>}
            </h4>
            <p className="text-sm text-gray-600">
              {item.request_type === 'offer' ? 'Offering this item' : 'Looking for this item'}
            </p>
          </div>
        </div>

        {/* Description */}
        {item.description && (
          <div>
            <h3 className="font-semibold text-lg mb-2">Description</h3>
            <p className="text-gray-600 whitespace-pre-wrap">{item.description}</p>
          </div>
        )}

        {/* Item Images */}
        {item.images && item.images.length > 0 && (
          <div>
            <h3 className="font-semibold text-lg mb-2">Images</h3>
            <div className="grid grid-cols-2 gap-2">
              {item.images.map((image, index) => (
                <img
                  key={index}
                  src={image}
                  alt={`${item.title} image ${index + 1}`}
                  className="rounded-lg object-cover aspect-square"
                />
              ))}
            </div>
          </div>
        )}

        {/* Legacy single image support */}
        {item.image_url && (!item.images || item.images.length === 0) && (
          <div>
            <h3 className="font-semibold text-lg mb-2">Image</h3>
            <img
              src={item.image_url}
              alt={item.title}
              className="rounded-lg w-full h-48 object-cover"
            />
          </div>
        )}

        {/* Date Information */}
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Calendar className="h-4 w-4" />
            <span>Posted: {format(new Date(item.created_at), 'MMM d, yyyy')}</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Calendar className="h-4 w-4" />
            <span>Available until: {format(new Date(item.valid_until), 'MMM d, yyyy')}</span>
          </div>
        </div>

        {/* Contact Actions */}
        {!isOwner && (
          <div className="pt-4 border-t">
            <Button className="w-full flex items-center gap-2">
              <MessageSquare className="h-4 w-4" />
              Contact {item.profiles?.display_name || 'Owner'}
            </Button>
          </div>
        )}
      </div>
    </SheetContent>
  );
};

export default GoodsSheetContent;