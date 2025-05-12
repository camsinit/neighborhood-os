
/**
 * NotificationFooter.tsx
 * 
 * Component for rendering the footer section of a notification card
 * with action buttons like View and Archive
 */
import React from "react";
import { Button } from "@/components/ui/button";
import { Eye, Archive } from "lucide-react";

// Props for the NotificationFooter component
interface NotificationFooterProps {
  isArchived: boolean;
  onView: (e: React.MouseEvent) => void;
  onArchive: (e: React.MouseEvent) => void;
}

/**
 * Component that displays the footer of a notification card
 * with action buttons
 */
export const NotificationFooter: React.FC<NotificationFooterProps> = ({
  isArchived,
  onView,
  onArchive
}) => {
  // Don't show actions if the notification is already archived
  if (isArchived) {
    return null;
  }

  return (
    <div className="flex border-t border-gray-100">
      <Button
        variant="ghost"
        size="sm"
        onClick={onView}
        className="flex-1 h-8 rounded-none text-xs text-gray-600 hover:bg-gray-50"
      >
        <Eye className="h-3.5 w-3.5 mr-1" />
        View
      </Button>
      <Button
        variant="ghost"
        size="sm"
        onClick={onArchive}
        className="flex-1 h-8 rounded-none text-xs text-gray-600 hover:bg-gray-50"
      >
        <Archive className="h-3.5 w-3.5 mr-1" />
        Archive
      </Button>
    </div>
  );
};

export default NotificationFooter;
