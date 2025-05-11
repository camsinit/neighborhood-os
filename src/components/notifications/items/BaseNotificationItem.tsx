
/**
 * BaseNotificationItem.tsx
 * 
 * Legacy compatibility component that maintains the old API while using
 * the new notification card system underneath.
 */
import React, { useState } from "react";
import { Archive } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { getNotificationStyle } from "../utils/notificationStyles";
import { HighlightableItemType } from "@/utils/highlight"; 
import { Card } from "@/components/ui/card";
import { highlightItem } from "@/utils/highlight";

interface BaseNotificationItemProps {
  title: string;
  type: HighlightableItemType;
  itemId: string;
  isRead?: boolean;
  isArchived?: boolean;
  onClose: () => void;
  onItemClick: (type: HighlightableItemType, id: string) => void;
  context?: {
    neighborName?: string;
    avatarUrl?: string;
  };
  children?: React.ReactNode;
}

/**
 * Base component for notification items that handles common layout and styling
 * This component is maintained for backward compatibility - new code should use
 * the specialized notification cards directly.
 */
const BaseNotificationItem = ({
  title,
  type,
  itemId,
  isRead = false,
  isArchived = false,
  onClose,
  onItemClick,
  context,
  children
}: BaseNotificationItemProps) => {
  // State for tracking removal animation
  const [isRemoving, setIsRemoving] = useState(false);
  const [height, setHeight] = useState<number | undefined>();
  
  // Get style information for this notification type
  const style = getNotificationStyle(type);
  const Icon = style.icon;

  // Handle archiving a notification
  const handleArchive = async (e: React.MouseEvent) => {
    e.stopPropagation();
    // Store the current height for smooth animation
    const element = e.currentTarget.closest('.notification-item');
    if (element) {
      setHeight(element.getBoundingClientRect().height);
    }
    
    // Trigger the swipe-out animation
    setIsRemoving(true);
    
    // Allow animation to finish before removing from DOM
    setTimeout(() => {
      onClose();
    }, 500); // Match timing with CSS animation duration
  };

  // Handle click to navigate to the item
  const handleClick = () => {
    // Use the highlight utility directly
    highlightItem(type, itemId, true);
    
    // For backwards compatibility, also call the onItemClick function
    onItemClick(type, itemId);
  };

  return (
    <Card 
      className={`notification-item flex items-center justify-between py-3 group cursor-pointer
        ${isRead ? 'bg-gray-50' : style.backgroundColor} hover:bg-gray-100 pr-6 pl-4 rounded-lg 
        transition-all duration-300 overflow-hidden border-l-4 ${isRead ? 'border-gray-200' : style.borderColor}
        ${isRemoving ? 'swipe-out-right' : 'opacity-100'}
      `}
      style={{
        height: isRemoving ? height : undefined
      }}
      onClick={handleClick}
    >
      <div className="flex items-center gap-3 flex-1 min-w-0">
        {context?.avatarUrl ? (
          <Avatar className="h-8 w-8 flex-shrink-0">
            <AvatarImage src={context.avatarUrl} alt={context.neighborName || ''} />
            <AvatarFallback>{context.neighborName?.charAt(0)}</AvatarFallback>
          </Avatar>
        ) : (
          <div className={`rounded-full p-1 ${isRead ? 'bg-gray-100' : style.backgroundColor}`}>
            <Icon className={`h-4 w-4 flex-shrink-0 ${isRead ? 'text-gray-600' : style.textColor}`} />
          </div>
        )}
        <div className="min-w-0 flex-1">
          <h3 className={`text-base ${isRead ? 'font-normal' : 'font-medium'} truncate ${isRead ? 'text-gray-600' : style.textColor}`}>
            {title}
          </h3>
          {children}
        </div>
      </div>
      {!isArchived && (
        <Button 
          variant="ghost" 
          size="icon" 
          className="h-8 w-8 hidden group-hover:inline-flex" 
          onClick={handleArchive}
        >
          <Archive className="h-4 w-4" />
        </Button>
      )}
    </Card>
  );
};

export default BaseNotificationItem;
