import { Bell, Calendar, Shield, HandHelping } from "lucide-react";

interface NotificationItemProps {
  title: string;
  type: "safety" | "event" | "support";
  itemId: string;
  onClose: () => void;
  onItemClick: (type: "safety" | "event" | "support", id: string) => void;
}

const NotificationItem = ({ title, type, itemId, onClose, onItemClick }: NotificationItemProps) => {
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
    onClose();
  };

  return (
    <div
      onClick={handleClick}
      className="flex items-start gap-3 p-3 hover:bg-gray-50 cursor-pointer"
    >
      {getIcon()}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-gray-900 truncate">{title}</p>
        <p className="text-xs text-gray-500 capitalize">{type}</p>
      </div>
    </div>
  );
};

export default NotificationItem;