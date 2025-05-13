
/**
 * SkillNotificationItem.tsx
 * 
 * A specialized component for showing skill-related notifications
 */
import React, { useState } from "react";
import { HeartHandshake } from "lucide-react";
import { Button } from "@/components/ui/button";
import { BaseNotification } from "@/hooks/notifications";
import { NotificationsPopover } from "../NotificationsPopover"; // Fixed import
import { useRouter } from "react-router-dom";
import { highlightItem } from "@/utils/highlight";

interface SkillNotificationItemProps {
  notification: BaseNotification;
  onDismiss?: () => void;
}

/**
 * Card specifically for skill exchange notifications
 */
const SkillNotificationItem: React.FC<SkillNotificationItemProps> = ({
  notification,
  onDismiss
}) => {
  // State for tracking popover
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);
  
  // Router for navigation
  const router = useRouter();

  // Navigate to the skill details
  const handleViewSkill = () => {
    setIsPopoverOpen(false);
    
    // Navigate to skills page
    router.navigate("/skills");
    
    // Highlight the skill after a short delay to allow page to load
    setTimeout(() => {
      if (notification.content_id) {
        highlightItem("skills", notification.content_id);
      }
    }, 100);
    
    // Call dismiss callback if provided
    if (onDismiss) {
      onDismiss();
    }
  };

  return (
    <NotificationsPopover
      title={notification.title}
      type="skill"
      itemId={notification.id}
      onAction={handleViewSkill}
      actionLabel="View Skill"
      isArchived={notification.is_archived}
      contentId={notification.content_id}
      contentType="skills"
    >
      <div className="cursor-pointer flex items-start p-4 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors">
        {/* Icon for skill notifications */}
        <div className="flex-shrink-0 mr-3">
          <div className="bg-purple-100 p-2 rounded-full">
            <HeartHandshake className="h-5 w-5 text-purple-700" />
          </div>
        </div>
        
        {/* Content */}
        <div className="flex-grow">
          <h4 className="font-medium">{notification.title}</h4>
          <p className="text-sm text-gray-500">
            {notification.description || "Someone wants to exchange skills with you"}
          </p>
          
          {/* Action button */}
          <div className="mt-2">
            <Button size="sm" variant="outline" onClick={handleViewSkill}>
              View Details
            </Button>
          </div>
        </div>
      </div>
    </NotificationsPopover>
  );
};

export default SkillNotificationItem;
