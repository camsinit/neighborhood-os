
import { Calendar, Book, Package, Heart, Shield, UserPlus } from "lucide-react";

/**
 * Color mapping for different activity types
 * Used for visual distinction in the activity feed
 * ENHANCED: Added neighbor_joined activity type
 */
export const getActivityColor = (type: string): string => {
  switch (type) {
    case 'event_created':
    case 'event_rsvp':
      return '#0EA5E9'; // Calendar blue
    case 'skill_offered':
    case 'skill_requested':
      return '#9b87f5'; // Skills purple
    case 'good_shared':
    case 'good_requested':
      return '#F97316'; // Goods orange
    case 'care_offered':
    case 'care_requested':
    case 'care_completed':
      return '#22C55E'; // Care green
    case 'safety_update':
      return '#EA384C'; // Safety red
    case 'neighbor_joined':
      return '#10B981'; // Welcome green
    default:
      return '#8E9196'; // Default gray
  }
};

/**
 * Icon mapping for different activity types
 * Provides a visual indicator for each activity type
 * ENHANCED: Added neighbor_joined activity type
 */
export const getActivityIcon = (type: string) => {
  switch (type) {
    case 'event_created':
    case 'event_rsvp':
      return Calendar;
    case 'skill_offered':
    case 'skill_requested':
      return Book;
    case 'good_shared':
    case 'good_requested':
      return Package;
    case 'care_offered':
    case 'care_requested':
    case 'care_completed':
      return Heart;
    case 'safety_update':
      return Shield;
    case 'neighbor_joined':
      return UserPlus;
    default:
      return null;
  }
};

/**
 * Background color mapping for different activity types
 * Used for hover effects
 * ENHANCED: Added neighbor_joined activity type
 */
export const getActivityBackground = (type: string) => {
  switch (type) {
    case 'event_created':
    case 'event_rsvp':
      return 'hover:bg-[#D3E4FD]/50';
    case 'skill_offered':
    case 'skill_requested':
      return 'hover:bg-[#E5DEFF]/50';
    case 'good_shared':
    case 'good_requested':
      return 'hover:bg-[#FEF7CD]/50';
    case 'care_offered':
    case 'care_requested':
      return 'hover:bg-[#F2FCE2]/50';
    case 'safety_update':
      return 'hover:bg-[#FDE1D3]/50';
    case 'neighbor_joined':
      return 'hover:bg-[#D1FAE5]/50';
    default:
      return 'hover:bg-gray-50';
  }
};

/**
 * Enhanced contextual descriptions for activity types
 * Provides more specific information for each activity
 * ENHANCED: Added neighbor_joined activity type
 */
export const getActivityContext = (type: string): string => {
  switch (type) {
    case 'event_created':
      return "New event added to the calendar";
    case 'event_rsvp':
      return "New event RSVP received";
    case 'skill_offered':
      return "A neighbor is offering to share their skills";
    case 'skill_requested':
      return "A neighbor is looking for help with a skill";
    case 'good_shared':
      return "New item shared with the community";
    case 'good_requested':
      return "New item request posted";
    case 'care_offered':
      return "New care offering available";
    case 'care_requested':
      return "A neighbor needs help";
    case 'care_completed':
      return "Help has been provided";
    case 'safety_update':
      return "New safety update posted";
    case 'neighbor_joined':
      return "A new neighbor has joined the community";
    default:
      return "New activity in the neighborhood";
  }
};

/**
 * Action button configuration for different activity types
 * ENHANCED: Added neighbor_joined activity type
 */
export const getActionButton = (activity: any) => {
  switch (activity.activity_type) {
    case 'event_created':
    case 'event_rsvp':
      return {
        label: "View Event",
        icon: Calendar,
        variant: "outline" as const,
      };
    case 'skill_offered':
    case 'skill_requested':
      return {
        label: activity.activity_type === 'skill_offered' ? "Learn More" : "Help Out",
        icon: Book,
        variant: "outline" as const,
      };
    case 'good_shared':
    case 'good_requested':
      return {
        label: "View Item",
        icon: Package,
        variant: "outline" as const,
      };
    case 'care_offered':
    case 'care_requested':
      return {
        label: activity.activity_type === 'care_offered' ? "Request Help" : "Offer Help",
        icon: Heart,
        variant: "outline" as const,
      };
    case 'safety_update':
      return {
        label: "Read More",
        icon: Shield,
        variant: "outline" as const,
      };
    case 'neighbor_joined':
      return {
        label: "Welcome",
        icon: UserPlus,
        variant: "outline" as const,
      };
    default:
      return null;
  }
};

/**
 * Extract description from activity metadata
 */
export const getActivityDescription = (metadata: any) => {
  if (!metadata) return null;
  if (typeof metadata === 'object' && metadata !== null && 'description' in metadata) {
    return metadata.description as string;
  }
  return null;
};

/**
 * Get a more descriptive title for skill activities
 */
export const getSkillActivityTitle = (activity: any) => {
  const baseTitle = activity.title || "Skill Exchange";
  const type = activity.activity_type;
  
  if (type === 'skill_offered') {
    return `Skill Offering: ${baseTitle}`;
  } else if (type === 'skill_requested') {
    return `Skill Request: ${baseTitle}`;
  }
  
  return baseTitle;
};
