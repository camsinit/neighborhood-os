
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Archive } from "lucide-react";
import { useState } from "react";
import SkillRequestPopover from "@/components/skills/notifications/SkillRequestPopover";
import { BaseNotification } from "@/hooks/notifications/types";
import { type HighlightableItemType } from "@/utils/highlight"; // Updated import path
// Using named import
import { NotificationPopover } from "../NotificationsPopover"; 
import { getNotificationStyle } from "../utils/notificationStyles";
import { Badge } from "@/components/ui/badge";

// Update the interface to make context optional with a default value
interface SkillNotificationItemProps {
  title: string;
  itemId: string;
  context?: BaseNotification['context']; // Make context optional
  isRead?: boolean;
  isArchived?: boolean;
  onClose: () => void;
  onArchive: (e: React.MouseEvent) => void;
  onItemClick?: (type: HighlightableItemType, id: string) => void; // Updated to use proper type
}

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

  // Only render if we have the correct context type
  // Add a fallback check to avoid null/undefined issues
  if (!context || context.contextType !== 'skill_request') {
    return null;
  }

  return (
    <div className="mb-2">
      {context && context.neighborName && (
        <p className="text-gray-500 italic mb-0.5 text-xs">
          {context.neighborName} is requesting your skill:
        </p>
      )}
      
      <NotificationPopover
        title={title}
        type="skills"
        itemId={itemId}
        onAction={() => setIsSkillRequestDialogOpen(true)}
        actionLabel="Respond"
        isArchived={isArchived}
        // Pass content ID and type for navigation
        contentId={context.skillRequestData?.skill?.id || itemId}
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
                {!isRead && (
                  <Badge variant="success" className="text-[10px] px-1.5 py-0">Action needed</Badge>
                )}
              </div>
              {context?.skillRequestData?.skill?.description && (
                <p className="text-xs text-gray-500 truncate">
                  {context.skillRequestData.skill.description}
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
        />
      )}
    </div>
  );
};
