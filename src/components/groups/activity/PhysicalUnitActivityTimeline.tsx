/**
 * Physical Unit Activity Timeline Component
 * 
 * Displays a chronological feed of physical unit activities including events, 
 * updates, resident movements, and the unit's creation. Mirrors the social group
 * timeline structure for universal interface consistency.
 */

import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { PhysicalUnitActivityItem } from '@/types/physicalUnitActivityTypes';
import { PhysicalUnitActivityCard } from './PhysicalUnitActivityCard';
import { Button } from '@/components/ui/button';
import { Plus, Calendar, MessageSquare } from 'lucide-react';
import { GroupViewTabs, GroupViewType } from './GroupViewTabs';
import { createLogger } from '@/utils/logger';

const logger = createLogger('PhysicalUnitActivityTimeline');

interface PhysicalUnitActivityTimelineProps {
  unitName: string;
  unitLabel: string;
  neighborhoodId: string;
  isUnitResident?: boolean;
  onCreateEvent?: () => void;
  onCreateUpdate?: () => void;
  showInviteButton?: boolean;
  onInvite?: () => void;
}

export const PhysicalUnitActivityTimeline: React.FC<PhysicalUnitActivityTimelineProps> = ({
  unitName,
  unitLabel,
  neighborhoodId,
  isUnitResident = false,
  onCreateEvent,
  onCreateUpdate,
  showInviteButton = false,
  onInvite
}) => {
  const [activeView, setActiveView] = useState<GroupViewType>('timeline');
  const [isCreateUpdateOpen, setIsCreateUpdateOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<any>(null);

  // Fetch unit-related activities
  const { data: unitActivities = [], isLoading, error } = useQuery({
    queryKey: ['physicalUnitActivities', unitName, neighborhoodId],
    queryFn: async (): Promise<PhysicalUnitActivityItem[]> => {
      logger.info('Fetching physical unit activities', { unitName, neighborhoodId });
      
      const activities: PhysicalUnitActivityItem[] = [];

      try {
        // Add unit start activity (simulated - this would come from unit creation data)
        activities.push({
          id: `unit-start-${unitName}`,
          type: 'unit_start',
          title: `${unitLabel.slice(0, -1)} created`,
          created_at: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days ago
          user_id: 'system',
          profiles: {
            display_name: 'System',
            avatar_url: undefined
          },
          unit: {
            unit_name: unitName,
            unit_label: unitLabel,
            created_at: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()
          }
        });

        // Fetch unit-related events from the events table
        const { data: events, error: eventsError } = await supabase
          .from('events')
          .select(`
            id,
            title,
            description,
            time,
            location,
            host_id,
            neighborhood_id,
            created_at,
            profiles:host_id(display_name, avatar_url)
          `)
          .eq('neighborhood_id', neighborhoodId)
          .ilike('location', `%${unitName}%`)
          .order('created_at', { ascending: false });

        if (eventsError) {
          logger.error('Error fetching unit events:', eventsError);
        } else if (events) {
          events.forEach(event => {
            activities.push({
              id: event.id,
              type: 'unit_event',
              title: event.title,
              created_at: event.created_at,
              user_id: event.host_id,
              profiles: event.profiles || undefined,
              event: {
                id: event.id,
                title: event.title,
                description: event.description,
                time: event.time,
                location: event.location,
                host_id: event.host_id,
                neighborhood_id: event.neighborhood_id
              }
            });
          });
        }

        // Fetch residents who joined/left (simulated - this would come from membership tracking)
        const { data: residents, error: residentsError } = await supabase
          .from('neighborhood_members')
          .select(`
            user_id,
            joined_at
          `)
          .eq('neighborhood_id', neighborhoodId)
          .eq('physical_unit_value', unitName);

        if (residentsError) {
          logger.error('Error fetching unit residents:', residentsError);
        } else if (residents) {
          // Fetch profiles separately for residents
          for (const resident of residents) {
            const { data: profile } = await supabase
              .from('profiles')
              .select('display_name, avatar_url')
              .eq('id', resident.user_id)
              .single();

            activities.push({
              id: `resident-joined-${resident.user_id}`,
              type: 'resident_joined',
              title: `${profile?.display_name || 'New resident'} moved in`,
              created_at: resident.joined_at,
              user_id: resident.user_id,
              profiles: {
                display_name: profile?.display_name,
                avatar_url: profile?.avatar_url
              },
              resident: {
                user_id: resident.user_id,
                display_name: profile?.display_name,
                avatar_url: profile?.avatar_url,
                joined_at: resident.joined_at
              }
            });
          }
        }

        // Sort all activities by creation date (newest first)
        activities.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

        logger.info('Physical unit activities fetched successfully', { 
          unitName,
          activityCount: activities.length 
        });

        return activities;
      } catch (error) {
        logger.error('Error fetching physical unit activities:', error);
        throw error;
      }
    }
  });

  // Event handlers
  const handleCreateUpdate = () => {
    setIsCreateUpdateOpen(true);
  };

  const handleEventClick = (event: any) => {
    setSelectedEvent(event);
  };

  // Filter activities based on active view
  const getFilteredActivities = (): PhysicalUnitActivityItem[] => {
    switch (activeView) {
      case 'events':
        return unitActivities.filter(activity => 
          activity.type === 'unit_event' || activity.type === 'unit_start'
        );
      case 'updates':
        return unitActivities.filter(activity => 
          activity.type === 'unit_update' || activity.type === 'unit_start'
        );
      default: // timeline
        return unitActivities;
    }
  };

  const filteredActivities = getFilteredActivities();

  if (isLoading) {
    // Loading skeleton matching social groups
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div className="h-8 w-32 bg-gray-200 rounded animate-pulse" />
          <div className="flex gap-2">
            <div className="h-10 w-24 bg-gray-200 rounded animate-pulse" />
            <div className="h-10 w-24 bg-gray-200 rounded animate-pulse" />
          </div>
        </div>
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="flex items-start space-x-3 p-3">
            <div className="w-10 h-10 bg-gray-200 rounded-full animate-pulse" />
            <div className="flex-1 space-y-2">
              <div className="h-4 w-3/4 bg-gray-200 rounded animate-pulse" />
              <div className="h-3 w-1/2 bg-gray-200 rounded animate-pulse" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-red-600">Error loading unit activities</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* View Tabs - matching social groups */}
      <GroupViewTabs 
        activeView={activeView} 
        onViewChange={setActiveView}
      >

        {/* Action Buttons - matching social groups layout */}
        <div className="flex items-center gap-3">
          {isUnitResident && (
            <>
              <Button
                onClick={handleCreateUpdate}
                className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg font-medium flex items-center gap-2"
              >
                <Plus className="h-4 w-4" />
                New Update
              </Button>
              
              {onCreateEvent && (
                <Button
                  onClick={onCreateEvent}
                  variant="outline"
                  className="px-4 py-2 rounded-lg font-medium flex items-center gap-2 border-blue-200 text-blue-600 hover:bg-blue-50"
                >
                  <Calendar className="h-4 w-4" />
                  New Event
                </Button>
              )}
            </>
          )}
          
          {showInviteButton && onInvite && (
            <Button
              onClick={onInvite}
              variant="outline"
              className="px-4 py-2 rounded-lg font-medium"
            >
              Invite Neighbors
            </Button>
          )}
        </div>

        {/* Activities List */}
        <div className="space-y-3">
          {filteredActivities.length > 0 ? (
            filteredActivities.map((activity) => (
              <PhysicalUnitActivityCard
                key={activity.id}
                activity={activity}
                onClick={() => {
                  if (activity.type === 'unit_event' && activity.event) {
                    handleEventClick(activity.event);
                  }
                }}
              />
            ))
          ) : (
            <div className="text-center py-8 text-gray-500">
              <MessageSquare className="h-12 w-12 mx-auto mb-2 text-gray-300" />
              <p>No activities yet</p>
              <p className="text-sm">Unit activities will appear here</p>
            </div>
          )}
        </div>

        {/* TODO: Add Create Update Modal */}
        {/* TODO: Add Event Detail Modal */}
      </GroupViewTabs>
    </div>
  );
};