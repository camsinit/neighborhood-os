/**
 * NeighborActivityTimeline - Displays a neighbor's recent activities in a timeline format
 * 
 * This component creates a visually appealing timeline showing the neighbor's
 * community involvement and activities using purple theme accents.
 * Now includes click navigation to related content.
 */
import React from 'react';
import { format, formatDistanceToNow } from 'date-fns';
import { useNavigate } from 'react-router-dom';
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
import { createItemNavigationService } from '@/services/navigation/ItemNavigationService';
import { HighlightableItemType } from '@/utils/highlight/types';

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
 * Maps activity types to highlightable item types for navigation
 */
const getHighlightableType = (activityType: ActivityType): HighlightableItemType | null => {
  switch (activityType) {
    case 'event_created':
      return 'event';
    case 'safety_update':
      return 'safety';
    case 'skill_offered':
    case 'skill_requested':
      return 'skills';
    case 'good_shared':
    case 'good_requested':
      return 'goods';
    case 'neighbor_joined':
    case 'profile_updated':
      return 'neighbors';
    default:
      return null;
  }
};

/**
 * Individual activity item component with navigation functionality
 */
const ActivityItem: React.FC<{ activity: Activity; isLast: boolean }> = ({ 
  activity, 
  isLast 
}) => {
  const navigate = useNavigate();
  const displayProps = getActivityDisplayProps(activity.activity_type);
  const IconComponent = displayProps.icon;
  
  // Create navigation service instance
  const navigationService = createItemNavigationService(navigate);
  
  // Handle click navigation to related content
  const handleItemClick = async () => {
    const highlightableType = getHighlightableType(activity.activity_type);
    
    // Only navigate if we have a valid type and content ID
    if (highlightableType && activity.content_id) {
      try {
        await navigationService.navigateToItem(highlightableType, activity.content_id, {
          showToast: true
        });
      } catch (error) {
        console.error('Navigation failed:', error);
        // Show a fallback message if navigation fails
        alert('Unable to navigate to this item - it may have been deleted.');
      }
    }
  };
  
  // Determine if this item is clickable
  const isClickable = getHighlightableType(activity.activity_type) && activity.content_id;
  
  return (
    <div 
      className={`relative flex items-start space-x-3 pb-4 ${
        isClickable ? 'cursor-pointer hover:bg-gray-50/50 rounded-lg p-2 -m-2 transition-colors' : ''
      }`}
      onClick={isClickable ? handleItemClick : undefined}
      data-neighbor-activity-id={activity.id}
      {...(isClickable && activity.content_id ? {
        [`data-${getHighlightableType(activity.activity_type)}-id`]: activity.content_id
      } : {})}
    >
      {/* Enhanced timeline line with better connectivity */}
      {!isLast && (
        <div 
          className="absolute left-[19px] top-10 bottom-2 w-0.5"
          style={{ backgroundColor: 'hsl(var(--neighbors-color) / 0.25)' }}
        />
      )}
      
      {/* Enhanced activity icon with better styling */}
      <div 
        className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center border-2 shadow-sm`}
        style={{ 
          borderColor: 'hsl(var(--neighbors-color) / 0.4)',
          backgroundColor: 'hsl(var(--neighbors-color) / 0.1)'
        }}
      >
        <IconComponent 
          className="w-5 h-5" 
          style={{ color: 'hsl(var(--neighbors-color))' }}
        />
      </div>
      
      {/* Activity content with enhanced interactivity */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between">
          <p className={`text-sm font-medium ${isClickable ? 'hover:underline' : ''}`}>
            {activity.title}
          </p>
          <div className="flex items-center text-xs text-gray-500">
            <Clock className="w-3 h-3 mr-1" />
            {formatDistanceToNow(new Date(activity.created_at), { addSuffix: true })}
          </div>
        </div>
        
        <p className="text-xs text-gray-600 mt-1">
          {displayProps.label}
          {isClickable && (
            <span className="ml-1 text-purple-600 text-xs">• Click to view</span>
          )}
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
 * Enhanced loading skeleton component for the timeline
 */
const TimelineSkeleton: React.FC = () => (
  <div className="space-y-4">
    {[...Array(3)].map((_, i) => (
      <div key={i} className="flex items-start space-x-3 p-2">
        <div 
          className="w-10 h-10 rounded-full animate-pulse border-2"
          style={{ 
            backgroundColor: 'hsl(var(--neighbors-color) / 0.1)',
            borderColor: 'hsl(var(--neighbors-color) / 0.2)'
          }}
        />
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