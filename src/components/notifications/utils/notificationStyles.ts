
/**
 * This file contains utility functions for notification styles
 * It defines color schemes and icons for each notification type
 */
import { 
  AlertTriangle, 
  Calendar, 
  HelpCircle, 
  PackageOpen, 
  ShoppingBag, 
  UserPlus 
} from "lucide-react";
import { HighlightableItemType } from "@/utils/highlightNavigation";

/**
 * Interface defining the style properties for different notification types
 */
interface NotificationStyle {
  icon: any;
  textColor: string;
  backgroundColor: string;
  hoverColor: string;
  borderColor: string;
}

/**
 * Returns style properties for a notification based on its type
 * 
 * @param type The notification type
 * @returns Style properties for the notification
 */
export const getNotificationStyle = (type: HighlightableItemType): NotificationStyle => {
  switch (type) {
    case "safety":
      return {
        icon: AlertTriangle,
        textColor: "text-red-600",
        backgroundColor: "bg-red-50",
        hoverColor: "hover:bg-red-100",
        borderColor: "border-red-500"
      };
      
    case "event":
      return {
        icon: Calendar,
        textColor: "text-blue-600",
        backgroundColor: "bg-blue-50",
        hoverColor: "hover:bg-blue-100",
        borderColor: "border-blue-500"
      };
      
    case "skills":
      return {
        icon: PackageOpen,
        textColor: "text-green-600",
        backgroundColor: "bg-green-50",
        hoverColor: "hover:bg-green-100",
        borderColor: "border-green-500"
      };
      
    case "goods":
      return {
        icon: ShoppingBag,
        textColor: "text-amber-600",
        backgroundColor: "bg-amber-50",
        hoverColor: "hover:bg-amber-100",
        borderColor: "border-amber-500"
      };
      
    case "neighbors":
      return {
        icon: UserPlus,
        textColor: "text-teal-600",
        backgroundColor: "bg-teal-50",
        hoverColor: "hover:bg-teal-100",
        borderColor: "border-teal-500"
      };
      
    default:
      return {
        icon: Calendar,
        textColor: "text-gray-600",
        backgroundColor: "bg-gray-50",
        hoverColor: "hover:bg-gray-100",
        borderColor: "border-gray-500"
      };
  }
};
