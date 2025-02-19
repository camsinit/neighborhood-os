import { Bell, Calendar, Shield, HandHelping, Check, Archive } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { supabase } from "@/integrations/supabase/client";
import { useState } from "react";
import { FinalizeDateDialog } from "@/components/skills/FinalizeDateDialog";

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

type TableName = "safety_updates" | "events" | "support_requests" | "skill_sessions";

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
  const getIcon = () => {
    switch (type) {
      case "safety":
        return <Shield className="h-4 w-4 text-red-500" />;
      case "event":
        return <Calendar className="h-4 w-4 text-blue-500" />;
      case "support":
        return <HandHelping className="h-4 w-4 text-green-500" />;
      default:
        return <Bell className="h-4 w-4" />;
    }
  };

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
    markAsRead();
    onClose();
  };

  const markAsRead = async () => {
    const table = getTableName(type);
    await supabase
      .from(table)
      .update({ is_read: true })
      .eq('id', itemId);
  };

  const handleArchive = async (e: React.MouseEvent) => {
    e.stopPropagation();
    const table = getTableName(type);
    await supabase
      .from(table)
      .update({ is_archived: true })
      .eq('id', itemId);
    onClose();
  };

  const [showDateDialog, setShowDateDialog] = useState(false);

  const handleAction = (e: React.MouseEvent) => {
    e.stopPropagation();
    
    if (actionType === 'schedule' && type === 'skills') {
      setShowDateDialog(true);
      return;
    }
    
    handleClick();
  };

  const getTableName = (type: "safety" | "event" | "support" | "skills"): TableName => {
    switch (type) {
      case "safety":
        return "safety_updates";
      case "event":
        return "events";
      case "support":
        return "support_requests";
      case "skills":
        return "skill_sessions";
    }
  };

  return (
    <>
      <div
        onClick={handleClick}
        className="flex items-start justify-between py-4 group hover:bg-gray-50 px-8 rounded-lg transition-colors cursor-pointer"
      >
        <div className="flex items-start gap-3">
          {context?.avatarUrl ? (
            <Avatar className="h-8 w-8">
              <AvatarImage src={context.avatarUrl} alt={context.neighborName} />
              <AvatarFallback>{context.neighborName?.charAt(0)}</AvatarFallback>
            </Avatar>
          ) : (
            getIcon()
          )}
          <div>
            {context && (
              <p className="text-sm text-gray-500 italic mb-1">
                {getContextText(context)}
              </p>
            )}
            <h3 className={`text-lg font-medium text-gray-900 ${isRead ? 'text-gray-500' : ''}`}>
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
              className="hidden group-hover:inline-flex"
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
    </>
  );
};

export default NotificationItem;
