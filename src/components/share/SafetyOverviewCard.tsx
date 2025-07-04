import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, Construction, Eye, User, MapPin, Clock } from 'lucide-react';
import { format, parseISO } from 'date-fns';

/**
 * Interface for safety overview card props
 */
interface SafetyOverviewCardProps {
  data: any; // Safety update data with profile information
  neighborhoodData: any; // Neighborhood context data
  onActionClick: () => void; // Action button handler
  actionButtonText: string; // Text for the action button
}

/**
 * SafetyOverviewCard - Public overview of a shared safety update
 * 
 * This component displays safety update information in a public context
 * without requiring authentication. It shows:
 * - Reporter profile image and name
 * - Safety update title, type, and description
 * - Timestamp and general area
 * - Neighborhood context
 * - Action button (join or view in dashboard)
 */
const SafetyOverviewCard: React.FC<SafetyOverviewCardProps> = ({
  data: safetyUpdate,
  neighborhoodData,
  onActionClick,
  actionButtonText
}) => {
  // Helper function to get icon and colors based on safety type
  const getTypeStyles = (type: string) => {
    switch (type) {
      case 'Emergency':
        return {
          icon: AlertTriangle,
          bgColor: 'bg-red-50',
          textColor: 'text-red-700',
          borderColor: 'border-red-200'
        };
      case 'Alert':
      case 'Suspicious Activity':
        return {
          icon: AlertTriangle,
          bgColor: 'bg-orange-50',
          textColor: 'text-orange-700',
          borderColor: 'border-orange-200'
        };
      case 'Maintenance':
        return {
          icon: Construction,
          bgColor: 'bg-yellow-50',
          textColor: 'text-yellow-700',
          borderColor: 'border-yellow-200'
        };
      case 'Observation':
      default:
        return {
          icon: Eye,
          bgColor: 'bg-blue-50',
          textColor: 'text-blue-700',
          borderColor: 'border-blue-200'
        };
    }
  };

  const typeStyles = getTypeStyles(safetyUpdate.type);
  const IconComponent = typeStyles.icon;

  // Format the creation date
  const createdDate = parseISO(safetyUpdate.created_at);
  const formattedDate = format(createdDate, 'MMMM d, yyyy');
  const formattedTime = format(createdDate, 'h:mm a');

  return (
    <Card className={`w-full max-w-2xl mx-auto shadow-lg border-l-4 ${typeStyles.borderColor}`}>
      <CardHeader className="pb-4">
        {/* Reporter profile section */}
        <div className="flex items-center gap-3 mb-4">
          <Avatar className="h-12 w-12">
            <AvatarImage 
              src={safetyUpdate.profiles?.avatar_url} 
              alt={safetyUpdate.profiles?.display_name || 'Reporter'} 
            />
            <AvatarFallback>
              <User className="h-6 w-6" />
            </AvatarFallback>
          </Avatar>
          <div>
            <p className="text-sm text-gray-600">Safety update by</p>
            <p className="font-medium text-gray-900">
              {safetyUpdate.profiles?.display_name || 'A neighbor'}
            </p>
          </div>
        </div>

        {/* Safety update title */}
        <CardTitle className="text-2xl font-bold text-gray-900">
          {safetyUpdate.title}
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Safety update details */}
        <div className="space-y-3">
          {/* Type and timestamp */}
          <div className="flex items-start gap-3">
            <IconComponent className="h-5 w-5 text-gray-500 mt-0.5" />
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Badge className={`${typeStyles.bgColor} ${typeStyles.textColor} border-0`}>
                  <IconComponent className="h-3 w-3 mr-1" />
                  {safetyUpdate.type}
                </Badge>
              </div>
              <p className="text-sm text-gray-600 flex items-center gap-1">
                <Clock className="h-4 w-4" />
                {formattedDate} at {formattedTime}
              </p>
            </div>
          </div>

          {/* Area/Location context */}
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

        {/* Safety update description */}
        {safetyUpdate.description && (
          <div>
            <h4 className="font-medium text-gray-900 mb-2">Details</h4>
            <p className="text-gray-600 leading-relaxed">{safetyUpdate.description}</p>
          </div>
        )}

        {/* Safety update badges */}
        <div className="flex flex-wrap gap-2">
          <Badge variant="secondary" className="flex items-center gap-1">
            <AlertTriangle className="h-3 w-3" />
            Safety Update
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
          <p>This safety update was shared from the {neighborhoodData?.name || 'neighborhood'} community</p>
        </div>
      </CardContent>
    </Card>
  );
};

export default SafetyOverviewCard;