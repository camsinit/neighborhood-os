import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { MapPin, Clock, User, Archive } from 'lucide-react';
import { format } from 'date-fns';
import { generateDataAttributes } from '@/utils/dataAttributes';
import { Sheet } from "@/components/ui/sheet";
import GoodsSheetContent from '../GoodsSheetContent';
import OptimizedImage from '../OptimizedImage';

// Fix: Update the interface to match actual usage
interface AvailableGoodsCardProps {
  item: any;
  onContact?: (item: any) => void;
  onClick?: () => void; // Add missing onClick prop
}
const AvailableGoodsCard = ({
  item,
  onContact,
  onClick
}: AvailableGoodsCardProps) => {
  const [isSheetOpen, setIsSheetOpen] = useState(false);

  // Generate data attributes for highlighting and navigation
  const dataAttributes = generateDataAttributes('goods', item.id);

  // Get the image URL - check both image_url and images array
  const getImageUrl = () => {
    // First try the direct image_url field
    if (item.image_url) {
      return item.image_url;
    }

    // Then try the images array (first image)
    if (item.images && Array.isArray(item.images) && item.images.length > 0) {
      return item.images[0];
    }
    return null;
  };
  const imageUrl = getImageUrl();
  // Handle card click to open sheet
  const handleCardClick = () => {
    setIsSheetOpen(true);
    if (onClick) {
      onClick();
    }
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

  // Helper function to capitalize first letter of each word
  const capitalizeFirstLetter = (text: string) => {
    return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
  };
  return <>
      <Card 
        className="w-48 overflow-hidden hover:shadow-lg transition-all duration-300 cursor-pointer group flex flex-col relative"
        {...dataAttributes} // Apply data attributes for highlighting
        onClick={handleCardClick} // Add click handler for card
      >
        {/* Image Section with overlay and tags - Fixed height */}
        <div className="h-32 overflow-hidden flex-shrink-0 relative">
          {/* Optimized image with progressive loading */}
          <div className="relative w-full h-full group-hover:scale-105 transition-transform duration-300">
            <OptimizedImage
              src={imageUrl}
              alt={item.title}
              className="w-full h-full"
              colorScheme="goods"
              loadingType="skeleton"
              enableRetry={true}
              maxRetries={2}
            />
          </div>
          
          {/* Available until overlay - always visible */}
          <div className="absolute bottom-2 left-2 bg-black/70 text-white text-xs px-2 py-1 rounded flex items-center gap-1">
            <Clock className="h-3 w-3" />
            Available until {format(new Date(item.valid_until), 'MMM d')}
          </div>

          {/* Tags in top right corner of image */}
          <div className="absolute top-2 right-2 flex flex-col gap-1">
            {item.urgency && <Badge variant="outline" className={`text-xs font-medium bg-white/90 backdrop-blur-sm ${getUrgencyColor(item.urgency)}`}>
                {capitalizeFirstLetter(item.urgency)}
              </Badge>}
            {item.goods_category && <Badge variant="secondary" className="text-xs bg-white/90 backdrop-blur-sm">
                {capitalizeFirstLetter(item.goods_category)}
              </Badge>}
            {item.condition && <Badge variant="outline" className="text-xs bg-white/90 backdrop-blur-sm">
                {capitalizeFirstLetter(item.condition)}
              </Badge>}
          </div>
        </div>

        {/* Content Section - Compact padding */}
        <div className="p-3">
          {/* Header with profile image and title */}
          <div className="flex items-center gap-2 mb-2">
            <Avatar className="h-6 w-6 flex-shrink-0">
              <AvatarImage src={item.profiles?.avatar_url} alt={item.profiles?.display_name} />
              <AvatarFallback>
                <User className="h-3 w-3" />
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <h3 className="text-base font-semibold text-gray-900 leading-tight line-clamp-2">
                {item.title}
              </h3>
            </div>
          </div>

          {/* Description - Limited to 2 lines */}
          {item.description && <p className="text-xs text-gray-600 line-clamp-2">
              {item.description}
            </p>}
        </div>
      </Card>


      {/* Sheet for detailed view */}
      <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
        <GoodsSheetContent item={item} onOpenChange={setIsSheetOpen} />
      </Sheet>
    </>;
};
export default AvailableGoodsCard;