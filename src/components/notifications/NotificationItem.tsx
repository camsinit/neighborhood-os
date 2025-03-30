
import { useState } from "react";
import { Archive } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { FinalizeDateDialog } from "@/components/skills/FinalizeDateDialog";
import { getNotificationStyle } from "./utils/notificationStyles";
import { archiveNotification, markAsRead } from "./utils/notificationActions";
import { useNavigate } from "react-router-dom";
import SkillRequestPopover from "@/components/skills/notifications/SkillRequestPopover";
import { SkillRequestNotification } from "@/components/skills/types/skillTypes";
import NotificationPopover from "./NotificationPopover";
import { HighlightableItemType } from "@/utils/highlightNavigation";

// Updated to include new notification context types
interface NotificationContext {
  neighborName?: string;
  avatarUrl?: string;
  contextType: "help_request" | "event_invite" | "safety_alert" | "skill_request" | "goods_offer" | "goods_request" | "neighbor_join";
  skillRequestData?: SkillRequestNotification;
}

// Updated to include new notification types
interface NotificationItemProps {
  title: string;
  type: HighlightableItemType;
  itemId: string;
  isRead?: boolean;
  isArchived?: boolean;
  onClose: () => void;
  onItemClick: (type: HighlightableItemType, id: string) => void;
  context?: NotificationContext;
}

const NotificationItem = ({
  title,
  type,
  itemId,
  isRead = false,
  isArchived = false,
  onClose,
  onItemClick,
  context
}: NotificationItemProps) => {
  const navigate = useNavigate();
  const [isRemoving, setIsRemoving] = useState(false);
  const [height, setHeight] = useState<number | undefined>();
  const [isSkillRequestDialogOpen, setIsSkillRequestDialogOpen] = useState(false);
  const style = getNotificationStyle(type);
  const Icon = style.icon;

  const getContextText = (context?: NotificationContext) => {
    if (!context) return null;
    switch (context.contextType) {
      case "help_request":
        return `Can you help ${context.neighborName} with`;
      case "event_invite":
        return `${context.neighborName} invites you to`;
      case "safety_alert":
        return `Important update from ${context.neighborName} about`;
      case "skill_request":
        return `${context.neighborName} is requesting your skill for`;
      case "goods_offer":
        return `${context.neighborName} is offering`;
      case "goods_request":
        return `${context.neighborName} is requesting`;
      case "neighbor_join":
        return `${context.neighborName} has joined the neighborhood`;
      default:
        return null;
    }
  };

  const handleArchive = async (e: React.MouseEvent) => {
    e.stopPropagation();
    const element = e.currentTarget.closest('.notification-item');
    if (element) {
      setHeight(element.getBoundingClientRect().height);
    }
    setIsRemoving(true);
    setTimeout(async () => {
      await archiveNotification(type, itemId);
      onClose();
    }, 300);
  };

  // Special handling for skill requests
  if (type === 'skills' && context?.contextType === 'skill_request' && context.skillRequestData) {
    return (
      <div className="mb-2">
        {context && (
          <p className="text-gray-500 italic mb-0.5 text-sm">
            {getContextText(context)}
          </p>
        )}
        
        <NotificationPopover
          title={title}
          type={type}
          itemId={itemId}
          onAction={() => setIsSkillRequestDialogOpen(true)}
          actionLabel="Respond"
          isArchived={isArchived}
        >
          <div 
            className={`notification-item h-[64px] flex items-center justify-between py-2 group cursor-pointer
              ${style.backgroundColor} ${style.hoverColor} pr-6 pl-4 rounded-lg 
              transition-all duration-300 overflow-hidden border-l-4 ${style.borderColor}
              ${isRemoving ? 'opacity-0 transform translate-x-full h-0 my-0 py-0' : 'opacity-100'}
              ${isRead ? 'opacity-75' : ''}
            `}
            style={{
              height: isRemoving ? 0 : height,
              marginBottom: isRemoving ? 0 : undefined,
              paddingTop: isRemoving ? 0 : undefined,
              paddingBottom: isRemoving ? 0 : undefined
            }}
          >
            <div className="flex items-center gap-3 flex-1 min-w-0">
              {context?.avatarUrl ? (
                <Avatar className="h-8 w-8 flex-shrink-0">
                  <AvatarImage src={context.avatarUrl} alt={context.neighborName || ''} />
                  <AvatarFallback>{context.neighborName?.charAt(0)}</AvatarFallback>
                </Avatar>
              ) : (
                <Icon className={`h-5 w-5 flex-shrink-0 ${style.textColor}`} />
              )}
              <div className="min-w-0 flex-1">
                <h3 className={`text-base font-medium truncate ${isRead ? 'text-gray-500' : style.textColor}`}>
                  {title}
                </h3>
              </div>
            </div>
            <div className="flex items-center gap-2">
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
          </div>
        </NotificationPopover>

        {/* Skill Request Dialog */}
        {context?.contextType === 'skill_request' && context.skillRequestData && (
          <SkillRequestPopover
            open={isSkillRequestDialogOpen}
            onOpenChange={setIsSkillRequestDialogOpen}
            notification={context.skillRequestData}
          />
        )}
      </div>
    );
  }

  return (
    <div className="mb-2">
      {context && (
        <p className="text-gray-500 italic mb-0.5 text-sm">
          {getContextText(context)}
        </p>
      )}
      
      <NotificationPopover
        title={title}
        type={type}
        itemId={itemId}
        isArchived={isArchived}
      >
        <div 
          className={`notification-item h-[64px] flex items-center justify-between py-2 group cursor-pointer
            ${style.backgroundColor} ${style.hoverColor} pr-6 pl-4 rounded-lg 
            transition-all duration-300 overflow-hidden border-l-4 ${style.borderColor}
            ${isRemoving ? 'opacity-0 transform translate-x-full h-0 my-0 py-0' : 'opacity-100'}
            ${isRead ? 'opacity-75' : ''}
          `}
          style={{
            height: isRemoving ? 0 : height,
            marginBottom: isRemoving ? 0 : undefined,
            paddingTop: isRemoving ? 0 : undefined,
            paddingBottom: isRemoving ? 0 : undefined
          }}
          onClick={() => markAsRead(type, itemId)}
        >
          <div className="flex items-center gap-3 flex-1 min-w-0">
            {context?.avatarUrl ? (
              <Avatar className="h-8 w-8 flex-shrink-0">
                <AvatarImage src={context.avatarUrl} alt={context.neighborName || ''} />
                <AvatarFallback>{context.neighborName?.charAt(0)}</AvatarFallback>
              </Avatar>
            ) : (
              <Icon className={`h-5 w-5 flex-shrink-0 ${style.textColor}`} />
            )}
            <div className="min-w-0 flex-1">
              <h3 className={`text-base font-medium truncate ${isRead ? 'text-gray-500' : style.textColor}`}>
                {title}
              </h3>
            </div>
          </div>
          <div className="flex items-center gap-2">
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
        </div>
      </NotificationPopover>
    </div>
  );
};

export default NotificationItem;
