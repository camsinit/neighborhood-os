
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Archive } from "lucide-react";
import { useState } from "react";
import SkillRequestPopover from "@/components/skills/notifications/SkillRequestPopover";
import NotificationPopover from "../NotificationPopover";
import { SkillNotificationContext } from "@/hooks/notifications/types";

interface SkillNotificationItemProps {
  title: string;
  itemId: string;
  context: SkillNotificationContext;
  isRead?: boolean;
  isArchived?: boolean;
  onClose: () => void;
  onArchive: (e: React.MouseEvent) => void;
}

export const SkillNotificationItem = ({
  title,
  itemId,
  context,
  isRead = false,
  isArchived = false,
  onClose,
  onArchive
}: SkillNotificationItemProps) => {
  const [isSkillRequestDialogOpen, setIsSkillRequestDialogOpen] = useState(false);

  return (
    <div className="mb-2">
      {context && (
        <p className="text-gray-500 italic mb-0.5 text-sm">
          {context.neighborName} is requesting your skill for
        </p>
      )}
      
      <NotificationPopover
        title={title}
        type="skills"
        itemId={itemId}
        onAction={() => setIsSkillRequestDialogOpen(true)}
        actionLabel="Respond"
        isArchived={isArchived}
      >
        <div className="notification-item h-[64px] flex items-center justify-between py-2 group cursor-pointer bg-blue-50 hover:bg-blue-100 pr-6 pl-4 rounded-lg transition-all duration-300 overflow-hidden border-l-4 border-blue-500">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            {context?.avatarUrl ? (
              <Avatar className="h-8 w-8 flex-shrink-0">
                <AvatarImage src={context.avatarUrl} alt={context.neighborName || ''} />
                <AvatarFallback>{context.neighborName?.charAt(0)}</AvatarFallback>
              </Avatar>
            ) : null}
            <div className="min-w-0 flex-1">
              <h3 className={`text-base font-medium truncate ${isRead ? 'text-gray-500' : 'text-blue-700'}`}>
                {title}
              </h3>
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
