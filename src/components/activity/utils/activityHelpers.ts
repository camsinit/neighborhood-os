
import { Calendar, Book, Package, Heart, Shield } from "lucide-react";

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
      return Heart;
    case 'safety_update':
      return Shield;
    default:
      return null;
  }
};

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
    default:
      return 'hover:bg-gray-50';
  }
};

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
    default:
      return null;
  }
};

export const getActivityDescription = (metadata: any) => {
  if (!metadata) return null;
  if (typeof metadata === 'object' && metadata !== null && 'description' in metadata) {
    return metadata.description as string;
  }
  return null;
};
