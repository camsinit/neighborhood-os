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
import { getActivityColor } from '@/components/activity/utils/activityHelpers';

/**
 * Format time distance in a short, concise format
 * Examples: "2m", "5hr", "3d", "2w", "1mo", "2yr"
 */
const formatShortTimeDistance = (date: Date): string => {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMinutes = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  const diffWeeks = Math.floor(diffDays / 7);
  const diffMonths = Math.floor(diffDays / 30);
  const diffYears = Math.floor(diffDays / 365);

  if (diffMinutes < 1) return 'now';
  if (diffMinutes < 60) return `${diffMinutes}m`;
  if (diffHours < 24) return `${diffHours}hr`;
  if (diffDays < 7) return `${diffDays}d`;
  if (diffWeeks < 4) return `${diffWeeks}w`;
  if (diffMonths < 12) return `${diffMonths}mo`;
  return `${diffYears}yr`;
};

/**
 * Props for the NeighborActivityTimeline component
 */
interface NeighborActivityTimelineProps {
  neighborId: string;
  neighborName: string;
}

/**
 * Parses activity title to extract the item name 
 * Example: "Safety Update: Suspicious Activity" -> "Suspicious Activity"
 */
const parseActivityItemName = (title: string, activityType: ActivityType): string => {
  // For most activities, remove the prefix to get the actual item name
  if (title.includes(': ')) {
    return title.split(': ')[1] || title;
  }
  
  // For neighbor activities, return as-is
  if (activityType === 'neighbor_joined' || activityType === 'profile_updated') {
    return title;
  }
  
  return title;
};

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
        label: 'Created'
      };
    case 'safety_update':
      return {
        icon: Shield,
        color: 'text-red-500',
        bgColor: 'bg-red-50',
        label: 'Shared'
      };
    case 'good_shared':
      return {
        icon: Gift,
        color: 'text-orange-500',
        bgColor: 'bg-orange-50',
        label: 'Shared'
      };
    case 'good_requested':
      return {
        icon: Gift,
        color: 'text-orange-500',
        bgColor: 'bg-orange-50',
        label: 'Requested'
      };
    case 'skill_offered':
      return {
        icon: Brain,
        color: 'text-green-500',
        bgColor: 'bg-green-50',
        label: 'Offered'
      };
    case 'skill_requested':
      return {
        icon: Brain,
        color: 'text-green-500',
        bgColor: 'bg-green-50',
        label: 'Requested'
      };
    case 'neighbor_joined':
      return {
        icon: Users,
        color: 'text-purple-500',
        bgColor: 'bg-purple-50',
        label: 'Joined the neighborhood'
      };
    case 'profile_updated':
      return {
        icon: User,
        color: 'text-gray-500',
        bgColor: 'bg-gray-50',
        label: 'Updated their profile'
      };
    default:
      return {
        icon: MessageSquare,
        color: 'text-gray-500',
        bgColor: 'bg-gray-50',
        label: 'Was active'
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
  
  // Parse the item name from the activity title
  const itemName = parseActivityItemName(activity.title, activity.activity_type);
  
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
      className={`relative flex items-center space-x-3 py-2 px-2 rounded-lg transition-all duration-200 border border-transparent ${
        isClickable ? 'cursor-pointer hover:bg-gray-50/50 hover:border-gray-200 hover:shadow-sm' : 'hover:shadow-sm'
      }`}
      onClick={isClickable ? handleItemClick : undefined}
      data-neighbor-activity-id={activity.id}
      {...(isClickable && activity.content_id ? {
        [`data-${getHighlightableType(activity.activity_type)}-id`]: activity.content_id
      } : {})}
    >
      {/* Activity icon with activity-specific colors and solid background to break the line */}
      <div 
        className={`relative flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center border-2 shadow-sm bg-white ${displayProps.bgColor}`}
        style={{ borderColor: 'hsl(var(--neighbors-color) / 0.2)' }}
      >
        <IconComponent 
          className={`w-5 h-5 ${displayProps.color}`}
        />
      </div>
      
      {/* Activity content with enhanced interactivity - vertically centered with icon */}
      <div className="flex-1 min-w-0 flex flex-col justify-center">
        <div className="flex items-center justify-between h-full group">
          <div className="text-sm flex-1 min-w-0 relative">
            {/* For neighbor activities, display as-is */}
            {(activity.activity_type === 'neighbor_joined' || activity.activity_type === 'profile_updated') ? (
              <span className="font-medium truncate block group-hover:hidden">{displayProps.label}</span>
            ) : (
              <span className="truncate block group-hover:hidden">
                <span className="font-medium">{displayProps.label}</span>
                <span className={`ml-1 font-medium ${displayProps.color}`}>
                  {itemName}
                </span>
              </span>
            )}
            
            {/* Full text on hover - can overlay the time */}
            <div className="absolute top-0 left-0 right-0 z-10 bg-white/95 backdrop-blur-sm px-2 py-1 rounded shadow-lg border border-gray-200 hidden group-hover:block">
              {(activity.activity_type === 'neighbor_joined' || activity.activity_type === 'profile_updated') ? (
                <span className="font-medium text-sm">{displayProps.label}</span>
              ) : (
                <span className="text-sm">
                  <span className="font-medium">{displayProps.label}</span>
                  <span className={`ml-1 font-medium ${displayProps.color}`}>
                    {itemName}
                  </span>
                </span>
              )}
            </div>
          </div>
          <div className="flex items-center text-xs text-gray-500 flex-shrink-0 ml-2">
            <Clock className="w-3 h-3 mr-1" />
            {formatShortTimeDistance(new Date(activity.created_at))}
          </div>
        </div>
        
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
      {/* Recent Activity heading sits above the container */}
      <h3 
        className="font-semibold text-lg mb-4 flex items-center gap-2"
        style={{ color: 'hsl(var(--neighbors-color))' }}
      >
        <Users className="w-5 h-5" />
        Recent Activity
      </h3>
      
      {/* Container with matching profile box styling */}
      <div 
        className="px-6 pb-6 pt-3 rounded-xl border-2 bg-white"
        style={{ 
          borderColor: 'hsl(var(--neighbors-color) / 0.2)'
        }}
      >
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
        <div className="relative space-y-2">
          {/* Continuous timeline line positioned behind all icons - perfectly centered */}
          {activities.length > 1 && (
            <div 
              className="absolute w-0.5 border-l-2 border-dotted" 
              style={{ 
                borderColor: 'hsl(var(--neighbors-color) / 0.2)',
                left: '28px', // Accounting for px-2 padding (8px) + icon center (20px) = 28px
                top: '20px', // Start from center of first icon
                height: `calc(100% - 3rem)` // Extends from first icon to near the last icon
              }}
            />
          )}
          
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
    </div>
  );
};

export default NeighborActivityTimeline;