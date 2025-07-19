import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { User, Clock, MapPin, Package, Archive } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import OptimizedImage from '@/components/goods/OptimizedImage';

/**
 * Interface for goods overview card props
 */
interface GoodsOverviewCardProps {
  data: any; // Goods data with profile information
  neighborhoodData: any; // Neighborhood context data
  onActionClick: () => void; // Action button handler
  actionButtonText: string; // Text for the action button
}

/**
 * GoodsOverviewCard - Public overview of a shared goods item
 * 
 * This component displays goods information in a public context
 * without requiring authentication. It shows:
 * - Provider profile image and name
 * - Item title, category, condition, and description
 * - Images if available
 * - Availability period and urgency
 * - Neighborhood context
 * - Action button (join or view in dashboard)
 */
const GoodsOverviewCard: React.FC<GoodsOverviewCardProps> = ({
  data: goodsItem,
  neighborhoodData,
  onActionClick,
  actionButtonText
}) => {
  // Helper function to get urgency colors
  const getUrgencyStyle = (urgency: string) => {
    const styles = {
      high: { bg: 'bg-red-50', text: 'text-red-700', border: 'border-red-200' },
      medium: { bg: 'bg-yellow-50', text: 'text-yellow-700', border: 'border-yellow-200' },
      low: { bg: 'bg-green-50', text: 'text-green-700', border: 'border-green-200' }
    };
    return styles[urgency as keyof typeof styles] || styles.low;
  };

  const urgencyStyle = goodsItem.urgency ? getUrgencyStyle(goodsItem.urgency) : null;

  // Get the image URL - check both image_url and images array
  const getImageUrl = () => {
    if (goodsItem.image_url) {
      return goodsItem.image_url;
    }
    if (goodsItem.images && Array.isArray(goodsItem.images) && goodsItem.images.length > 0) {
      return goodsItem.images[0];
    }
    return null;
  };

  const imageUrl = getImageUrl();

  // Format dates
  const createdDate = parseISO(goodsItem.created_at);
  const validUntilDate = parseISO(goodsItem.valid_until);
  const formattedCreated = format(createdDate, 'MMMM d, yyyy');
  const formattedValidUntil = format(validUntilDate, 'MMMM d, yyyy');

  // Capitalize first letter for display
  const capitalizeFirst = (str: string) => {
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
  };

  return (
    <Card className="w-full max-w-2xl mx-auto shadow-lg">
      <CardHeader className="pb-4">
        {/* Provider profile section */}
        <div className="flex items-center gap-3 mb-4">
          <Avatar className="h-12 w-12">
            <AvatarImage 
              src={goodsItem.profiles?.avatar_url} 
              alt={goodsItem.profiles?.display_name || 'Item Provider'} 
            />
            <AvatarFallback>
              <User className="h-6 w-6" />
            </AvatarFallback>
          </Avatar>
          <div>
            <p className="text-sm text-gray-600">
              {goodsItem.request_type === 'offer' ? 'Item offered by' : 'Item requested by'}
            </p>
            <p className="font-medium text-gray-900">
              {goodsItem.profiles?.display_name || 'A neighbor'}
            </p>
          </div>
        </div>

        {/* Item title */}
        <CardTitle className="text-2xl font-bold text-gray-900">
          {goodsItem.title}
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Item image with optimized loading */}
        <div className="relative overflow-hidden rounded-lg h-64">
          <OptimizedImage
            src={imageUrl}
            alt={goodsItem.title}
            className="w-full h-full"
            colorScheme="goods"
            loadingType="skeleton"
            enableRetry={true}
            maxRetries={2}
          />
        </div>

        {/* Item details */}
        <div className="space-y-3">
          {/* Category and condition */}
          <div className="flex items-start gap-3">
            <Package className="h-5 w-5 text-gray-500 mt-0.5" />
            <div>
              <p className="font-medium text-gray-900">Item details</p>
              <div className="flex flex-wrap gap-2 mt-1">
                {goodsItem.goods_category && (
                  <Badge variant="secondary">
                    {capitalizeFirst(goodsItem.goods_category)}
                  </Badge>
                )}
                {goodsItem.condition && (
                  <Badge variant="outline">
                    {capitalizeFirst(goodsItem.condition)} condition
                  </Badge>
                )}
                <Badge variant="outline">
                  {goodsItem.request_type === 'offer' ? 'Available' : 'Needed'}
                </Badge>
              </div>
            </div>
          </div>

          {/* Urgency (if applicable) */}
          {goodsItem.urgency && urgencyStyle && (
            <div className="flex items-start gap-3">
              <Clock className="h-5 w-5 text-gray-500 mt-0.5" />
              <div>
                <p className="font-medium text-gray-900">Priority</p>
                <Badge className={`${urgencyStyle.bg} ${urgencyStyle.text} border-0 mt-1`}>
                  {capitalizeFirst(goodsItem.urgency)} priority
                </Badge>
              </div>
            </div>
          )}

          {/* Location context */}
          <div className="flex items-start gap-3">
            <MapPin className="h-5 w-5 text-gray-500 mt-0.5" />
            <div>
              <p className="font-medium text-gray-900">Area</p>
              <p className="text-sm text-gray-600">
                {neighborhoodData?.name || 'Neighborhood'} community
                {neighborhoodData?.city && neighborhoodData?.state && (
                  <span> • {neighborhoodData.city}, {neighborhoodData.state}</span>
                )}
              </p>
            </div>
          </div>
        </div>

        {/* Item description */}
        {goodsItem.description && (
          <div>
            <h4 className="font-medium text-gray-900 mb-2">Description</h4>
            <p className="text-gray-600 leading-relaxed">{goodsItem.description}</p>
          </div>
        )}

        {/* Availability info */}
        <div className="text-sm text-gray-500 space-y-1">
          <p>Posted: {formattedCreated}</p>
          <p>Available until: {formattedValidUntil}</p>
        </div>

        {/* Item badges */}
        <div className="flex flex-wrap gap-2">
          <Badge variant="secondary" className="flex items-center gap-1">
            <Package className="h-3 w-3" />
            {goodsItem.request_type === 'offer' ? 'Free Item' : 'Item Request'}
          </Badge>
          {neighborhoodData && (
            <Badge variant="outline">
              {neighborhoodData.name}
            </Badge>
          )}
        </div>

        {/* Action button */}
        <div className="pt-4 border-t">
          <Button 
            onClick={onActionClick}
            className="w-full"
            size="lg"
          >
            {actionButtonText}
          </Button>
        </div>

        {/* Footer information */}
        <div className="text-center text-sm text-gray-500">
          <p>This item was shared from the {neighborhoodData?.name || 'neighborhood'} community</p>
        </div>
      </CardContent>
    </Card>
  );
};

export default GoodsOverviewCard;