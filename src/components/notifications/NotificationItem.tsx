
import { useState } from "react";
import { Archive } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { FinalizeDateDialog } from "@/components/skills/FinalizeDateDialog";
import { getNotificationStyle } from "./utils/notificationStyles";
import { archiveNotification, markAsRead } from "./utils/notificationActions";

interface NotificationContext {
  neighborName?: string;
  avatarUrl?: string;
  contextType: "help_request" | "event_invite" | "safety_alert";
}

interface NotificationItemProps {
  title: string;
  type: "safety" | "event" | "support" | "skills";
  itemId: string;
  isRead?: boolean;
  isArchived?: boolean;
  onClose: () => void;
  onItemClick: (type: "safety" | "event" | "support" | "skills", id: string) => void;
  context?: NotificationContext;
  actionLabel?: string;
  actionType?: "rsvp" | "comment" | "help" | "respond" | "share" | "view" | "schedule";
}

const NotificationItem = ({ 
  title, 
  type, 
  itemId, 
  isRead = false,
  isArchived = false,
  onClose, 
  onItemClick,
  context,
  actionLabel = "View",
  actionType = "view"
}: NotificationItemProps) => {
  const [isRemoving, setIsRemoving] = useState(false);
  const [height, setHeight] = useState<number | undefined>();
  const [showDateDialog, setShowDateDialog] = useState(false);
  
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
      default:
        return null;
    }
  };

  const handleClick = () => {
    onItemClick(type, itemId);
    markAsRead(type, itemId);
    onClose();
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

  const handleAction = (e: React.MouseEvent) => {
    e.stopPropagation();
    
    if (actionType === 'schedule' && type === 'skills') {
      setShowDateDialog(true);
      return;
    }
    
    handleClick();
  };

  return (
    <div className="mb-4">
      {/* Context text now sits above the notification card */}
      {context && (
        <p className="text-sm text-gray-500 italic mb-1">
          {getContextText(context)}
        </p>
      )}
      
      {/* Notification card */}
      <div
        onClick={handleClick}
        className={`notification-item flex items-start justify-between py-4 group 
          ${style.backgroundColor} ${style.hoverColor} px-8 rounded-lg 
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
        <div className="flex items-start gap-3">
          {context?.avatarUrl ? (
            <Avatar className="h-8 w-8">
              <AvatarImage src={context.avatarUrl} alt={context.neighborName} />
              <AvatarFallback>{context.neighborName?.charAt(0)}</AvatarFallback>
            </Avatar>
          ) : (
            <Icon className={`h-5 w-5 ${style.textColor}`} />
          )}
          <div>
            <h3 className={`text-lg font-medium ${isRead ? 'text-gray-500' : style.textColor}`}>
              {title}
            </h3>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {!isArchived && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleAction}
              className={`hidden group-hover:inline-flex ${style.textColor} ${style.borderColor}`}
            >
              {actionLabel}
            </Button>
          )}
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 hidden group-hover:inline-flex"
            onClick={handleArchive}
          >
            <Archive className="h-4 w-4" />
          </Button>
        </div>
      </div>
      
      {actionType === 'schedule' && (
        <FinalizeDateDialog
          sessionId={itemId}
          open={showDateDialog}
          onOpenChange={setShowDateDialog}
        />
      )}
    </div>
  );
};

export default NotificationItem;
