import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Calendar, Clock, MapPin, User, Users } from 'lucide-react';
import { format, parseISO } from 'date-fns';

/**
 * Interface for event overview card props
 */
interface EventOverviewCardProps {
  data: any; // Event data with profile information
  neighborhoodData: any; // Neighborhood context data
  onActionClick: () => void; // Action button handler
  actionButtonText: string; // Text for the action button
}

/**
 * EventOverviewCard - Public overview of a shared event
 * 
 * This component displays event information in a public context
 * without requiring authentication. It shows:
 * - Event host profile image and name
 * - Event title, date, time, and location
 * - Event description
 * - Neighborhood context
 * - Action button (join or view in dashboard)
 */
const EventOverviewCard: React.FC<EventOverviewCardProps> = ({
  data: event,
  neighborhoodData,
  onActionClick,
  actionButtonText
}) => {
  // Format the event date and time for display
  const eventDate = parseISO(event.time);
  const formattedDate = format(eventDate, 'EEEE, MMMM d, yyyy');
  const formattedTime = format(eventDate, 'h:mm a');

  return (
    <Card className="w-full max-w-2xl mx-auto shadow-lg">
      <CardHeader className="pb-4">
        {/* Host profile section */}
        <div className="flex items-center gap-3 mb-4">
          <Avatar className="h-12 w-12">
            <AvatarImage 
              src={event.profiles?.avatar_url} 
              alt={event.profiles?.display_name || 'Event Host'} 
            />
            <AvatarFallback>
              <User className="h-6 w-6" />
            </AvatarFallback>
          </Avatar>
          <div>
            <p className="text-sm text-gray-600">Event hosted by</p>
            <p className="font-medium text-gray-900">
              {event.profiles?.display_name || 'A neighbor'}
            </p>
          </div>
        </div>

        {/* Event title */}
        <CardTitle className="text-2xl font-bold text-gray-900">
          {event.title}
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Event details */}
        <div className="space-y-3">
          {/* Date and time */}
          <div className="flex items-start gap-3">
            <Calendar className="h-5 w-5 text-gray-500 mt-0.5" />
            <div>
              <p className="font-medium text-gray-900">{formattedDate}</p>
              <p className="text-sm text-gray-600 flex items-center gap-1">
                <Clock className="h-4 w-4" />
                {formattedTime}
              </p>
            </div>
          </div>

          {/* Location */}
          <div className="flex items-start gap-3">
            <MapPin className="h-5 w-5 text-gray-500 mt-0.5" />
            <div>
              <p className="font-medium text-gray-900">Location</p>
              <p className="text-sm text-gray-600">{event.location}</p>
            </div>
          </div>
        </div>

        {/* Event description */}
        {event.description && (
          <div>
            <h4 className="font-medium text-gray-900 mb-2">About this event</h4>
            <p className="text-gray-600 leading-relaxed">{event.description}</p>
          </div>
        )}

        {/* Event badges */}
        <div className="flex flex-wrap gap-2">
          <Badge variant="secondary" className="flex items-center gap-1">
            <Calendar className="h-3 w-3" />
            Event
          </Badge>
          {neighborhoodData && (
            <Badge variant="outline">
              {neighborhoodData.name}
            </Badge>
          )}
          {event.is_recurring && (
            <Badge variant="outline">
              Recurring
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
          <p>This event was shared from the {neighborhoodData?.name || 'neighborhood'} community</p>
        </div>
      </CardContent>
    </Card>
  );
};

export default EventOverviewCard;