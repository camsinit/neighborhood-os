/**
 * Group Event Detail Panel Component
 * 
 * Side panel for displaying detailed event information with:
 * - Event details and RSVP information
 * - Temporary overlay over group panel
 * - Navigation back to group timeline
 */

import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { X, Calendar, Clock, MapPin, Users } from 'lucide-react';
import { formatDate } from '@/utils/date';

interface GroupEventDetailProps {
  eventId: string;
  onClose: () => void;
}

export const GroupEventDetail: React.FC<GroupEventDetailProps> = ({
  eventId,
  onClose
}) => {
  // Fetch event details
  const { data: event, isLoading } = useQuery({
    queryKey: ['event-detail', eventId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('events')
        .select(`
          id,
          title,
          description,
          time,
          location,
          host_id,
          group_id,
          neighborhood_id,
          created_at,
          profiles:host_id (
            display_name,
            avatar_url
          )
        `)
        .eq('id', eventId)
        .single();

      if (error) throw error;
      return data;
    },
    enabled: !!eventId,
  });

  // Fetch RSVP count
  const { data: rsvpCount = 0 } = useQuery({
    queryKey: ['event-rsvps', eventId],
    queryFn: async () => {
      const { count, error } = await supabase
        .from('event_rsvps')
        .select('*', { count: 'exact', head: true })
        .eq('event_id', eventId);

      if (error) throw error;
      return count || 0;
    },
    enabled: !!eventId,
  });

  if (isLoading || !event) {
    return (
      <div className="absolute inset-0 bg-background border rounded-lg shadow-lg z-20 p-4">
        <div className="flex items-center justify-between mb-4">
          <div className="h-6 bg-muted rounded w-32 animate-pulse" />
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="w-4 h-4" />
          </Button>
        </div>
        <div className="space-y-4">
          <div className="h-4 bg-muted rounded animate-pulse" />
          <div className="h-4 bg-muted rounded w-3/4 animate-pulse" />
          <div className="h-4 bg-muted rounded w-1/2 animate-pulse" />
        </div>
      </div>
    );
  }

  const hostName = event.profiles?.display_name || 'Unknown Host';
  const hostAvatar = event.profiles?.avatar_url;

  return (
    <div className="absolute inset-0 bg-background border rounded-lg shadow-lg z-20 animate-in slide-in-from-right-4 duration-200">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b">
        <div className="flex items-center space-x-2">
          <Calendar className="w-5 h-5 text-blue-600" />
          <h2 className="text-lg font-semibold">Event Details</h2>
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={onClose}
          className="h-8 w-8"
        >
          <X className="w-4 h-4" />
        </Button>
      </div>

      {/* Content */}
      <div className="p-4 space-y-6">
        {/* Event Title */}
        <div>
          <h1 className="text-xl font-bold text-foreground mb-2">
            {event.title}
          </h1>
          <Badge variant="outline" className="text-blue-600 border-blue-200">
            Group Event
          </Badge>
        </div>

        {/* Host Information */}
        <div className="flex items-center space-x-3">
          <Avatar className="w-10 h-10">
            <AvatarImage src={hostAvatar} />
            <AvatarFallback>
              {hostName.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div>
            <p className="text-sm font-medium">Hosted by</p>
            <p className="text-sm text-muted-foreground">{hostName}</p>
          </div>
        </div>

        {/* Event Details */}
        <div className="space-y-3">
          <div className="flex items-center space-x-3">
            <Clock className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm">{formatDate(event.time)}</span>
          </div>
          
          {event.location && (
            <div className="flex items-center space-x-3">
              <MapPin className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm">{event.location}</span>
            </div>
          )}
          
          <div className="flex items-center space-x-3">
            <Users className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm">{rsvpCount} attending</span>
          </div>
        </div>

        {/* Description */}
        {event.description && (
          <div>
            <h3 className="font-medium mb-2">Description</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {event.description}
            </p>
          </div>
        )}

        {/* Action Buttons */}
        <div className="pt-4 border-t">
          <Button className="w-full mb-2 bg-blue-600 hover:bg-blue-700">
            RSVP to Event
          </Button>
          <Button variant="outline" className="w-full" onClick={onClose}>
            Back to Timeline
          </Button>
        </div>
      </div>
    </div>
  );
};