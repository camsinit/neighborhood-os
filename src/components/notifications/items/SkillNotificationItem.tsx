
/**
 * SkillNotificationItem.tsx
 * 
 * Component for displaying skill-related notifications with rich context
 */
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Archive } from "lucide-react";
import { useState } from "react";
import SkillRequestPopover from "@/components/skills/notifications/SkillRequestPopover";
import { BaseNotification } from "@/hooks/notifications/types";
import { highlightItem, type HighlightableItemType } from "@/utils/highlight"; 
import { NotificationPopover } from "../NotificationsPopover"; 
import { getNotificationStyle } from "../utils/notificationStyles";
import { Badge } from "@/components/ui/badge";

interface SkillNotificationItemProps {
  title: string;
  itemId: string;
  context?: BaseNotification['context']; // Context is optional with a default value
  isRead?: boolean;
  isArchived?: boolean;
  onClose: () => void;
  onArchive: (e: React.MouseEvent) => void;
  onItemClick?: (type: HighlightableItemType, id: string) => void; 
}

/**
 * Component for displaying skill-related notifications
 * 
 * This component renders different layouts based on the notification context
 */
export const SkillNotificationItem = ({
  title,
  itemId,
  context,
  isRead = false,
  isArchived = false,
  onClose,
  onArchive,
  onItemClick
}: SkillNotificationItemProps) => {
  const [isSkillRequestDialogOpen, setIsSkillRequestDialogOpen] = useState(false);
  const style = getNotificationStyle('skills');

  // Early return if missing context or not a skill notification
  if (!context) return null;

  // Handle clicking on the notification
  const handleNotificationClick = () => {
    // Determine what to highlight based on the context
    const targetId = context.skillId || context.skillRequestData?.skill?.id || itemId;
    const targetType: HighlightableItemType = 'skills';
    
    // If there's an event ID, highlight that instead
    if (context.event_id) {
      highlightItem('event', context.event_id, true);
    } else {
      highlightItem(targetType, targetId, true);
    }
    
    // Call the onItemClick handler if provided
    if (onItemClick) {
      onItemClick(targetType, targetId);
    }
    
    // Close the notification after clicking
    onClose();
  };
  
  // Determine if this notification requires action
  const requiresAction = context.actionRequired === true || 
                         context.contextType === 'skill_request';
  
  // Determine if this is a session notification
  const isSessionNotification = context.contextType === 'skill_session';
  
  // Determine action button label
  const actionLabel = requiresAction ? 'Respond' : 
                      isSessionNotification ? 'View Session' : 'View Details';

  return (
    <div className="mb-2">
      {context && context.neighborName && (
        <p className="text-gray-500 italic mb-0.5 text-xs">
          {context.contextType === 'skill_request' 
            ? `${context.neighborName} is requesting your skill:` 
            : context.contextType === 'skill_session' 
              ? `Session with ${context.neighborName}:` 
              : `${context.neighborName} ${isSessionNotification ? 'confirmed' : 'shared'}:`}
        </p>
      )}
      
      <NotificationPopover
        title={title}
        type="skills"
        itemId={itemId}
        onAction={requiresAction ? () => setIsSkillRequestDialogOpen(true) : handleNotificationClick}
        actionLabel={actionLabel}
        isArchived={isArchived}
        contentId={context.skillId || context.skillRequestData?.skill?.id || itemId}
        contentType="skills"
      >
        <div className={`notification-item h-[64px] flex items-center justify-between py-2 group cursor-pointer 
            ${style.backgroundColor} ${style.hoverColor} pr-6 pl-4 rounded-lg transition-all duration-300 overflow-hidden 
            border-l-4 ${isRead ? 'border-gray-200' : style.borderColor}`}>
          <div className="flex items-center gap-3 flex-1 min-w-0">
            {context?.avatarUrl ? (
              <Avatar className="h-8 w-8 flex-shrink-0">
                <AvatarImage src={context.avatarUrl} alt={context.neighborName || ''} />
                <AvatarFallback>{context.neighborName?.charAt(0) || '?'}</AvatarFallback>
              </Avatar>
            ) : null}
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <h3 className={`text-base font-medium truncate ${isRead ? 'text-gray-500' : style.textColor}`}>
                  {title}
                </h3>
                {requiresAction && !isRead && (
                  <Badge variant="success" className="text-[10px] px-1.5 py-0">Action needed</Badge>
                )}
              </div>
              {(context?.skillRequestData?.skill?.description || context?.skillDescription) && (
                <p className="text-xs text-gray-500 truncate">
                  {context?.skillRequestData?.skill?.description || context?.skillDescription || ""}
                </p>
              )}
            </div>
          </div>
          {!isArchived && (
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-8 w-8 hidden group-hover:inline-flex" 
              onClick={onArchive}
            >
              <Archive className="h-4 w-4" />
            </Button>
          )}
        </div>
      </NotificationPopover>

      {context?.skillRequestData && (
        <SkillRequestPopover
          open={isSkillRequestDialogOpen}
          onOpenChange={setIsSkillRequestDialogOpen}
          notification={context.skillRequestData}
          onClose={onClose}  // Pass the onClose prop to the popover
        />
      )}
    </div>
  );
};

export default SkillNotificationItem;
