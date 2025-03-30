
import { Bell, Calendar, Shield, HandHelping, Check, Archive, Package, Users } from "lucide-react";

// Updated to include new notification context types
export type NotificationContextType = 
  | "help_request" 
  | "event_invite" 
  | "safety_alert" 
  | "skill_request" 
  | "goods_offer" 
  | "goods_request" 
  | "neighbor_join";

export interface NotificationStyle {
  backgroundColor: string;
  hoverColor: string;
  textColor: string;
  borderColor: string;
  icon: typeof Bell | typeof Calendar | typeof Shield | typeof HandHelping | typeof Package | typeof Users;
}

// Updated to include new notification types
export const getNotificationStyle = (
  type: "safety" | "event" | "support" | "skills" | "goods" | "neighbors"
): NotificationStyle => {
  switch (type) {
    case "safety":
      return {
        backgroundColor: "bg-red-50",
        hoverColor: "hover:bg-red-100",
        textColor: "text-red-700",
        borderColor: "border-red-200",
        icon: Shield
      };
    case "event":
      return {
        backgroundColor: "bg-violet-50",
        hoverColor: "hover:bg-violet-100",
        textColor: "text-violet-700",
        borderColor: "border-violet-200",
        icon: Calendar
      };
    case "support":
      return {
        backgroundColor: "bg-orange-50",
        hoverColor: "hover:bg-orange-100",
        textColor: "text-orange-700",
        borderColor: "border-orange-200",
        icon: HandHelping
      };
    case "skills":
      return {
        backgroundColor: "bg-blue-50",
        hoverColor: "hover:bg-blue-100",
        textColor: "text-blue-700",
        borderColor: "border-blue-200",
        icon: Bell
      };
    case "goods":
      return {
        backgroundColor: "bg-green-50",
        hoverColor: "hover:bg-green-100",
        textColor: "text-green-700",
        borderColor: "border-green-200",
        icon: Package
      };
    case "neighbors":
      return {
        backgroundColor: "bg-amber-50",
        hoverColor: "hover:bg-amber-100",
        textColor: "text-amber-700",
        borderColor: "border-amber-200",
        icon: Users
      };
  }
};
