
import { Bell, Calendar, Shield, HandHelping, Check, Archive } from "lucide-react";

// Types for notification context and styling
export type NotificationContextType = "help_request" | "event_invite" | "safety_alert";

export interface NotificationStyle {
  backgroundColor: string;
  hoverColor: string;
  textColor: string;
  borderColor: string;
  icon: typeof Bell | typeof Calendar | typeof Shield | typeof HandHelping;
}

// Get style configuration based on notification type
export const getNotificationStyle = (type: "safety" | "event" | "support" | "skills"): NotificationStyle => {
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
  }
};
