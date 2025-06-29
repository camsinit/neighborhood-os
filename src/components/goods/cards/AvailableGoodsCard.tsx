
import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { MapPin, Clock, User, MessageCircle, Archive } from 'lucide-react';
import { format } from 'date-fns';
import { generateDataAttributes } from '@/utils/dataAttributes';
// Fix: Import as default export instead of named export
import ItemRequestDialog from '@/components/items/dialogs/ItemRequestDialog';

// Fix: Update the interface to match actual usage
interface AvailableGoodsCardProps {
  item: any;
  onContact?: (item: any) => void;
  onClick?: () => void; // Add missing onClick prop
}

const AvailableGoodsCard = ({ item, onContact, onClick }: AvailableGoodsCardProps) => {
  const [isRequestDialogOpen, setIsRequestDialogOpen] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);

  // Generate data attributes for highlighting and navigation
  const dataAttributes = generateDataAttributes('goods', item.id);

  // Debug logging for image issues
  console.log('AvailableGoodsCard - Item data:', {
    title: item.title,
    id: item.id,
    image_url: item.image_url,
    hasImageUrl: !!item.image_url,
    imageUrlType: typeof item.image_url,
    imageUrlLength: item.image_url?.length
  });

  const handleContactClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsRequestDialogOpen(true);
  };

  // Handle card click to open details
  const handleCardClick = () => {
    if (onClick) {
      onClick();
    }
  };

  const handleImageLoad = () => {
    console.log('Image loaded successfully for:', item.title);
    setImageLoaded(true);
    setImageError(false);
  };

  const handleImageError = () => {
    console.log('Image failed to load for:', item.title, 'URL:', item.image_url);
    setImageError(true);
    setImageLoaded(false);
  };

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case 'high':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low':
        return 'bg-green-100 text-green-800 border-green-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <>
      <Card 
        className="w-80 h-[440px] overflow-hidden hover:shadow-lg transition-all duration-300 cursor-pointer group flex flex-col"
        {...dataAttributes} // Apply data attributes for highlighting
        onClick={handleCardClick} // Add click handler for card
      >
        {/* Image Section with overlay - Fixed height */}
        <div className="h-48 overflow-hidden flex-shrink-0 relative">
          {item.image_url && !imageError ? (
            <>
              <img
                src={item.image_url}
                alt={item.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                onLoad={handleImageLoad}
                onError={handleImageError}
              />
              {/* Available until overlay on image */}
              <div className="absolute bottom-2 left-2 bg-black/70 text-white text-xs px-2 py-1 rounded flex items-center gap-1">
                <Clock className="h-3 w-3" />
                Available until {format(new Date(item.valid_until), 'MMM d')}
              </div>
            </>
          ) : (
            /* Fallback for items without images or failed to load */
            <div className="w-full h-full bg-gray-200 flex items-center justify-center">
              <div className="text-gray-500 text-center">
                <Archive className="h-8 w-8 mx-auto mb-2" />
                <span className="text-xs">
                  {imageError ? 'Image failed to load' : 'No image'}
                </span>
                {/* Debug info */}
                {item.image_url && (
                  <div className="text-xs mt-1 opacity-70">
                    URL: {item.image_url.substring(0, 30)}...
                  </div>
                )}
              </div>
              {/* Available until overlay for no-image items */}
              <div className="absolute bottom-2 left-2 bg-black/70 text-white text-xs px-2 py-1 rounded flex items-center gap-1">
                <Clock className="h-3 w-3" />
                Available until {format(new Date(item.valid_until), 'MMM d')}
              </div>
            </div>
          )}
        </div>

        {/* Content Section - Flexible height with consistent padding */}
        <div className="p-4 flex flex-col flex-1">
          {/* Header with title and urgency */}
          <div className="flex items-start justify-between gap-3 mb-3">
            <h3 className="text-lg font-semibold text-gray-900 leading-tight flex-1 line-clamp-2">
              {item.title}
            </h3>
            {item.urgency && (
              <Badge 
                variant="outline" 
                className={`text-xs font-medium flex-shrink-0 ${getUrgencyColor(item.urgency)}`}
              >
                {item.urgency}
              </Badge>
            )}
          </div>

          {/* Description - Limited to 2 lines */}
          {item.description && (
            <p className="text-sm text-gray-600 mb-4 line-clamp-2 flex-shrink-0">
              {item.description}
            </p>
          )}

          {/* Category and Condition */}
          <div className="flex items-center gap-2 mb-4 flex-shrink-0">
            {item.goods_category && (
              <Badge variant="secondary" className="text-xs">
                {item.goods_category}
              </Badge>
            )}
            {item.condition && (
              <Badge variant="outline" className="text-xs">
                {item.condition}
              </Badge>
            )}
          </div>

          {/* Spacer to push footer to bottom */}
          <div className="flex-1"></div>

          {/* Provider Info */}
          <div className="flex items-center gap-3 mb-4 flex-shrink-0">
            <Avatar className="h-8 w-8">
              <AvatarImage src={item.profiles?.avatar_url} alt={item.profiles?.display_name} />
              <AvatarFallback>
                <User className="h-4 w-4" />
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-900">
                {item.profiles?.display_name || 'Anonymous'}
              </p>
              <p className="text-xs text-gray-500">
                {format(new Date(item.created_at), 'MMM d, yyyy')}
              </p>
            </div>
          </div>

          {/* Action Button - Fixed at bottom */}
          <div className="flex-shrink-0">
            <Button
              size="sm"
              onClick={handleContactClick}
              className="bg-blue-600 hover:bg-blue-700 text-white w-full"
            >
              <MessageCircle className="h-4 w-4 mr-1" />
              Request
            </Button>
          </div>
        </div>
      </Card>

      {/* Request Dialog */}
      <ItemRequestDialog
        open={isRequestDialogOpen}
        onOpenChange={setIsRequestDialogOpen}
        request={item} // Fix: Use 'request' prop instead of 'item'
      />
    </>
  );
};

export default AvailableGoodsCard;
