
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

  // Generate data attributes for highlighting and navigation
  const dataAttributes = generateDataAttributes('goods', item.id);

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
        className="overflow-hidden hover:shadow-lg transition-all duration-300 cursor-pointer group"
        {...dataAttributes} // Apply data attributes for highlighting
        onClick={handleCardClick} // Add click handler for card
      >
        {/* Image Section */}
        {item.image_url && (
          <div className="aspect-video overflow-hidden">
            <img
              src={item.image_url}
              alt={item.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
          </div>
        )}

        <div className="p-4">
          {/* Header with title and urgency */}
          <div className="flex items-start justify-between gap-3 mb-3">
            <h3 className="text-lg font-semibold text-gray-900 leading-tight flex-1">
              {item.title}
            </h3>
            {item.urgency && (
              <Badge 
                variant="outline" 
                className={`text-xs font-medium ${getUrgencyColor(item.urgency)}`}
              >
                {item.urgency}
              </Badge>
            )}
          </div>

          {/* Description */}
          {item.description && (
            <p className="text-sm text-gray-600 mb-4 line-clamp-2">
              {item.description}
            </p>
          )}

          {/* Category and Condition */}
          <div className="flex items-center gap-2 mb-4">
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

          {/* Provider Info */}
          <div className="flex items-center gap-3 mb-4">
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

          {/* Footer with availability and action */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1 text-xs text-gray-500">
              <Clock className="h-3 w-3" />
              Available until {format(new Date(item.valid_until), 'MMM d')}
            </div>
            
            <Button
              size="sm"
              onClick={handleContactClick}
              className="bg-blue-600 hover:bg-blue-700 text-white"
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
