/**
 * NeighborActivityTimeline - Displays a neighbor's recent activities in a timeline format
 * 
 * This component creates a visually appealing timeline showing the neighbor's
 * community involvement and activities using purple theme accents.
 */
import React from 'react';
import { format, formatDistanceToNow } from 'date-fns';
import { 
  Calendar, 
  Shield, 
  Gift, 
  Brain, 
  Users, 
  MessageSquare,
  Clock,
  User
} from 'lucide-react';
import { useNeighborActivities } from './hooks/useNeighborActivities';
import { Activity, ActivityType } from '@/utils/queries/activities/types';

/**
 * Props for the NeighborActivityTimeline component
 */
interface NeighborActivityTimelineProps {
  neighborId: string;
  neighborName: string;
}

/**
 * Maps activity types to their display properties (icon, color, label)
 */
const getActivityDisplayProps = (activityType: ActivityType) => {
  switch (activityType) {
    case 'event_created':
      return {
        icon: Calendar,
        color: 'text-blue-500',
        bgColor: 'bg-blue-50',
        label: 'created an event'
      };
    case 'safety_update':
      return {
        icon: Shield,
        color: 'text-red-500',
        bgColor: 'bg-red-50',
        label: 'shared a safety update'
      };
    case 'good_shared':
      return {
        icon: Gift,
        color: 'text-orange-500',
        bgColor: 'bg-orange-50',
        label: 'shared an item'
      };
    case 'good_requested':
      return {
        icon: Gift,
        color: 'text-orange-500',
        bgColor: 'bg-orange-50',
        label: 'requested an item'
      };
    case 'skill_offered':
      return {
        icon: Brain,
        color: 'text-green-500',
        bgColor: 'bg-green-50',
        label: 'offered a skill'
      };
    case 'skill_requested':
      return {
        icon: Brain,
        color: 'text-green-500',
        bgColor: 'bg-green-50',
        label: 'requested help with a skill'
      };
    case 'neighbor_joined':
      return {
        icon: Users,
        color: 'text-purple-500',
        bgColor: 'bg-purple-50',
        label: 'joined the neighborhood'
      };
    case 'profile_updated':
      return {
        icon: User,
        color: 'text-gray-500',
        bgColor: 'bg-gray-50',
        label: 'updated their profile'
      };
    default:
      return {
        icon: MessageSquare,
        color: 'text-gray-500',
        bgColor: 'bg-gray-50',
        label: 'was active'
      };
  }
};

/**
 * Individual activity item component
 */
const ActivityItem: React.FC<{ activity: Activity; isLast: boolean }> = ({ 
  activity, 
  isLast 
}) => {
  const displayProps = getActivityDisplayProps(activity.activity_type);
  const IconComponent = displayProps.icon;
  
  return (
    <div className="relative flex items-start space-x-3 pb-4">
      {/* Timeline line */}
      {!isLast && (
        <div 
          className="absolute left-[15px] top-8 bottom-0 w-0.5 bg-gradient-to-b from-neighbors-color/30 to-transparent"
          style={{ backgroundColor: 'hsl(var(--neighbors-color) / 0.2)' }}
        />
      )}
      
      {/* Activity icon */}
      <div 
        className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${displayProps.bgColor} border-2`}
        style={{ borderColor: 'hsl(var(--neighbors-color) / 0.3)' }}
      >
        <IconComponent className={`w-4 h-4 ${displayProps.color}`} />
      </div>
      
      {/* Activity content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-900 font-medium">
            {activity.title}
          </p>
          <div className="flex items-center text-xs text-gray-500">
            <Clock className="w-3 h-3 mr-1" />
            {formatDistanceToNow(new Date(activity.created_at), { addSuffix: true })}
          </div>
        </div>
        
        <p className="text-xs text-gray-600 mt-1">
          {displayProps.label}
        </p>
        
        {/* Show formatted date for older activities */}
        {new Date().getTime() - new Date(activity.created_at).getTime() > 7 * 24 * 60 * 60 * 1000 && (
          <p className="text-xs text-gray-400 mt-1">
            {format(new Date(activity.created_at), 'MMM d, yyyy')}
          </p>
        )}
      </div>
    </div>
  );
};

/**
 * Loading skeleton component for the timeline
 */
const TimelineSkeleton: React.FC = () => (
  <div className="space-y-4">
    {[...Array(3)].map((_, i) => (
      <div key={i} className="flex items-start space-x-3">
        <div className="w-8 h-8 rounded-full bg-gray-200 animate-pulse" />
        <div className="flex-1 space-y-2">
          <div className="h-4 bg-gray-200 rounded animate-pulse w-3/4" />
          <div className="h-3 bg-gray-200 rounded animate-pulse w-1/2" />
        </div>
      </div>
    ))}
  </div>
);

/**
 * Main timeline component
 */
const NeighborActivityTimeline: React.FC<NeighborActivityTimelineProps> = ({ 
  neighborId, 
  neighborName 
}) => {
  const { data: activities, isLoading, error } = useNeighborActivities(neighborId);

  // Show loading state
  if (isLoading) {
    return (
      <div>
        <h3 
          className="font-semibold text-lg mb-4 flex items-center gap-2"
          style={{ color: 'hsl(var(--neighbors-color))' }}
        >
          <Users className="w-5 h-5" />
          Recent Activity
        </h3>
        <TimelineSkeleton />
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div>
        <h3 
          className="font-semibold text-lg mb-4 flex items-center gap-2"
          style={{ color: 'hsl(var(--neighbors-color))' }}
        >
          <Users className="w-5 h-5" />
          Recent Activity
        </h3>
        <p className="text-gray-500 text-sm italic">
          Unable to load activity timeline
        </p>
      </div>
    );
  }

  // Show empty state or activities
  return (
    <div>
      <h3 
        className="font-semibold text-lg mb-4 flex items-center gap-2"
        style={{ color: 'hsl(var(--neighbors-color))' }}
      >
        <Users className="w-5 h-5" />
        Recent Activity
      </h3>
      
      {!activities || activities.length === 0 ? (
        <div className="text-center py-6">
          <Users 
            className="w-12 h-12 mx-auto mb-3 opacity-30"
            style={{ color: 'hsl(var(--neighbors-color))' }}
          />
          <p className="text-gray-500 text-sm">
            {neighborName} hasn't been active recently
          </p>
          <p className="text-gray-400 text-xs mt-1">
            Activity will appear here as they participate in the community
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {activities.map((activity, index) => (
            <ActivityItem
              key={activity.id}
              activity={activity}
              isLast={index === activities.length - 1}
            />
          ))}
          
          {/* Show "View More" if there are many activities */}
          {activities.length >= 10 && (
            <div className="text-center pt-4">
              <button 
                className="text-sm text-purple-600 hover:text-purple-700 font-medium"
                style={{ color: 'hsl(var(--neighbors-color))' }}
              >
                View all activity →
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default NeighborActivityTimeline;