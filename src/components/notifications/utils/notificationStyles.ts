
/**
 * This file defines styling properties for different types of notifications
 * These styles are used to provide visual differentiation between notification types
 */
import { 
  Bell, 
  Calendar, 
  CheckCircle, 
  AlertTriangle, 
  ShoppingCart, 
  UserPlus,
  Clock
} from "lucide-react";
import { HighlightableItemType } from "@/utils/highlight/types";

/**
 * Interface for styling properties of a notification
 */
interface NotificationStyle {
  icon: any; // The icon component to display
  backgroundColor: string; // Background color class for the notification item
  hoverColor: string; // Background color class when hovering
  borderColor: string; // Border color class for the left border
  textColor: string; // Text color class for the title or important text
}

/**
 * Get styling properties for a specific notification type
 * 
 * @param type The type of notification
 * @returns Styling properties for the notification
 */
export const getNotificationStyle = (
  type: string
): NotificationStyle => {
  // Define styles based on notification type
  switch (type) {
    case "safety":
      return {
        icon: AlertTriangle,
        backgroundColor: "bg-red-50",
        hoverColor: "hover:bg-red-100",
        borderColor: "border-red-500",
        textColor: "text-red-700"
      };
    case "event":
      return {
        icon: Calendar,
        backgroundColor: "bg-blue-50",
        hoverColor: "hover:bg-blue-100",
        borderColor: "border-blue-500",
        textColor: "text-blue-700"
      };
    case "skills":
      return {
        icon: CheckCircle,
        backgroundColor: "bg-green-50",
        hoverColor: "hover:bg-green-100",
        borderColor: "border-green-500",
        textColor: "text-green-700"
      };
    case "goods":
      return {
        icon: ShoppingCart,
        backgroundColor: "bg-amber-50",
        hoverColor: "hover:bg-amber-100",
        borderColor: "border-amber-500",
        textColor: "text-amber-700"
      };
    case "neighbors":
      return {
        icon: UserPlus,
        backgroundColor: "bg-purple-50",
        hoverColor: "hover:bg-purple-100", 
        borderColor: "border-purple-500",
        textColor: "text-purple-700"
      };
    default:
      return {
        icon: Bell,
        backgroundColor: "bg-gray-50", 
        hoverColor: "hover:bg-gray-100",
        borderColor: "border-gray-300",
        textColor: "text-gray-700"
      };
  }
};

/**
 * Get a readable description for a notification type
 * 
 * @param type The notification type
 * @returns A human-readable name for the notification type
 */
export const getNotificationTypeName = (
  type: string
): string => {
  switch (type) {
    case "safety":
      return "Safety Update";
    case "event":
      return "Event";
    case "skills":
      return "Skills";
    case "goods":
      return "Goods Exchange";
    case "neighbors":
      return "New Neighbor";
    default:
      return "Notification";
  }
};

/**
 * Get a formatted time string from a timestamp
 * 
 * @param timestamp The timestamp to format
 * @returns A human-readable time string (e.g., "3h ago")
 */
export const getTimeAgo = (
  timestamp: string
): string => {
  const now = new Date();
  const date = new Date(timestamp);
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);
  
  // Less than a minute
  if (seconds < 60) {
    return "just now";
  }
  
  // Less than an hour
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) {
    return `${minutes}m ago`;
  }
  
  // Less than a day
  const hours = Math.floor(minutes / 60);
  if (hours < 24) {
    return `${hours}h ago`;
  }
  
  // Less than a week
  const days = Math.floor(hours / 24);
  if (days < 7) {
    return `${days}d ago`;
  }
  
  // More than a week
  const weeks = Math.floor(days / 7);
  return `${weeks}w ago`;
};
