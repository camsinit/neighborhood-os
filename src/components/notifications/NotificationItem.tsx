import { Bell, Calendar, Shield, HandHelping, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";

interface NotificationItemProps {
  title: string;
  type: "safety" | "event" | "support";
  itemId: string;
  isRead?: boolean;
  isArchived?: boolean;
  onClose: () => void;
  onItemClick: (type: "safety" | "event" | "support", id: string) => void;
}

type TableName = "safety_updates" | "events" | "support_requests";

const NotificationItem = ({ 
  title, 
  type, 
  itemId, 
  isRead = false,
  isArchived = false,
  onClose, 
  onItemClick 
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
      className={`flex items-center gap-3 p-3 hover:bg-gray-50 cursor-pointer ${
        isRead ? 'bg-gray-50' : ''
      }`}
    >
      {getIcon()}
      <div className="flex-1 min-w-0">
        <p className={`text-sm font-medium text-gray-900 truncate ${
          isRead ? 'text-gray-500' : ''
        }`}>
          {title}
        </p>
        <p className="text-xs text-gray-500 capitalize">{type}</p>
      </div>
      {!isRead && (
        <Button
          variant="ghost"
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