
import { Bell, Calendar, Shield, HandHelping, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { supabase } from "@/integrations/supabase/client";

interface NotificationContext {
  neighborName?: string;
  avatarUrl?: string;
  contextType: "help_request" | "event_invite" | "safety_alert";
}

interface NotificationItemProps {
  title: string;
  type: "safety" | "event" | "support";
  itemId: string;
  isRead?: boolean;
  isArchived?: boolean;
  onClose: () => void;
  onItemClick: (type: "safety" | "event" | "support", id: string) => void;
  context?: NotificationContext;
}

type TableName = "safety_updates" | "events" | "support_requests";

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
      .update({ is_read: true, is_archived: true })
      .eq('id', itemId);
  };

  const getTableName = (type: "safety" | "event" | "support"): TableName => {
    switch (type) {
      case "safety":
        return "safety_updates";
      case "event":
        return "events";
      case "support":
        return "support_requests";
    }
  };

  return (
    <div
      onClick={handleClick}
      className="flex items-start justify-between py-4 group hover:bg-gray-50 px-8 rounded-lg transition-colors"
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
          <p className="text-gray-500 text-sm capitalize">{type}</p>
        </div>
      </div>
      {!isRead && (
        <Button
          variant="outline"
          size="icon"
          className="h-6 w-6"
          onClick={(e) => {
            e.stopPropagation();
            markAsRead();
          }}
        >
          <Check className="h-4 w-4" />
        </Button>
      )}
    </div>
  );
};

export default NotificationItem;
