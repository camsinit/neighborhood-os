
import {
  Bell,
  Calendar,
  MessageSquare,
  Shield,
  ShoppingCart,
  User,
  CheckCircle,
  AlertTriangle,
  Gift,
  UserPlus
} from "lucide-react";
import { HighlightableItemType } from "@/utils/highlightNavigation";

// Define the style mapping for each notification type
export const getNotificationStyle = (type: HighlightableItemType) => {
  const styles: Record<HighlightableItemType, {
    backgroundColor: string;
    hoverColor: string;
    borderColor: string;
    textColor: string;
    icon: React.ElementType;
  }> = {
    event: {
      backgroundColor: 'bg-blue-50',
      hoverColor: 'hover:bg-blue-100',
      borderColor: 'border-blue-500',
      textColor: 'text-blue-700',
      icon: Calendar
    },
    skills: {
      backgroundColor: 'bg-green-50',
      hoverColor: 'hover:bg-green-100',
      borderColor: 'border-green-500',
      textColor: 'text-green-700',
      icon: CheckCircle
    },
    goods: {
      backgroundColor: 'bg-orange-50',
      hoverColor: 'hover:bg-orange-100',
      borderColor: 'border-orange-500',
      textColor: 'text-orange-700',
      icon: ShoppingCart
    },
    freebies: {
      backgroundColor: 'bg-orange-50',
      hoverColor: 'hover:bg-orange-100',
      borderColor: 'border-orange-500',
      textColor: 'text-orange-700',
      icon: Gift
    },
    support: {
      backgroundColor: 'bg-purple-50',
      hoverColor: 'hover:bg-purple-100',
      borderColor: 'border-purple-500',
      textColor: 'text-purple-700',
      icon: MessageSquare
    },
    safety: {
      backgroundColor: 'bg-red-50',
      hoverColor: 'hover:bg-red-100',
      borderColor: 'border-red-500',
      textColor: 'text-red-700',
      icon: AlertTriangle
    },
    neighbors: {
      backgroundColor: 'bg-teal-50',
      hoverColor: 'hover:bg-teal-100',
      borderColor: 'border-teal-500',
      textColor: 'text-teal-700',
      icon: UserPlus
    }
  };

  return styles[type] || styles.event;
};
