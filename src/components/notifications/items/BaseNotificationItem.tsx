
import React, { useState } from "react";
import { Archive } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { getNotificationStyle } from "../utils/notificationStyles";
import { HighlightableItemType } from "@/utils/highlight"; // Updated import path

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
    const element = e.currentTarget.closest('.notification-item');
    if (element) {
      setHeight(element.getBoundingClientRect().height);
    }
    setIsRemoving(true);
    setTimeout(() => {
      onClose();
    }, 300);
  };

  // Determine the styling based on read status
  const bgColor = isRead ? 'bg-gray-50' : style.backgroundColor;
  const hoverColor = isRead ? 'hover:bg-gray-100' : style.hoverColor;
  const borderColor = isRead ? 'border-gray-200' : style.borderColor;
  const textColor = isRead ? 'text-gray-600' : style.textColor;
  const fontWeight = isRead ? 'font-normal' : 'font-medium';

  return (
    <div 
      className={`notification-item flex items-center justify-between py-3 group cursor-pointer
        ${bgColor} ${hoverColor} pr-6 pl-4 rounded-lg 
        transition-all duration-300 overflow-hidden border-l-4 ${borderColor}
        ${isRemoving ? 'opacity-0 transform translate-x-full h-0 my-0 py-0' : 'opacity-100'}
      `}
      style={{
        height: isRemoving ? 0 : height,
        marginBottom: isRemoving ? 0 : undefined,
        paddingTop: isRemoving ? 0 : undefined,
        paddingBottom: isRemoving ? 0 : undefined
      }}
      onClick={() => onItemClick(type, itemId)}
    >
      <div className="flex items-center gap-3 flex-1 min-w-0">
        {context?.avatarUrl ? (
          <Avatar className="h-8 w-8 flex-shrink-0">
            <AvatarImage src={context.avatarUrl} alt={context.neighborName || ''} />
            <AvatarFallback>{context.neighborName?.charAt(0)}</AvatarFallback>
          </Avatar>
        ) : (
          <div className={`rounded-full p-1 ${isRead ? 'bg-gray-100' : style.backgroundColor}`}>
            <Icon className={`h-4 w-4 flex-shrink-0 ${textColor}`} />
          </div>
        )}
        <div className="min-w-0 flex-1">
          <h3 className={`text-base ${fontWeight} truncate ${textColor}`}>
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
    </div>
  );
};

export default BaseNotificationItem;
