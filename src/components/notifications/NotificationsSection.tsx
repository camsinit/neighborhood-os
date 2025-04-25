
/**
 * NotificationsSection Component
 * 
 * This component handles displaying the notifications section of the HomePage,
 * including the header, archive toggle button, and the list of notifications.
 */
import { useState } from "react";
import { Archive } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import NotificationItem from "@/components/notifications/NotificationItem";
import { useNavigate } from "react-router-dom";
import { useNotifications, archiveNotification } from "@/hooks/notifications"; // Add missing import

/**
 * Component to display the notifications section on the homepage
 */
const NotificationsSection = () => {
  // Track whether we're showing archived notifications
  const [showArchived, setShowArchived] = useState(false);
  const navigate = useNavigate();
  
  // Fetch notifications with our custom hook
  const { data: notifications, refetch } = useNotifications(showArchived);

  /**
   * Handle clicks on notification items
   * 
   * Navigates to the appropriate page and highlights the relevant item
   */
  const handleItemClick = (
    type: "safety" | "event" | "support" | "skills" | "goods" | "neighbors", 
    id: string
  ) => {
    // Map notification types to their respective routes
    const routeMap = {
      safety: "/safety",
      event: "/calendar",
      support: "/care",
      skills: "/skills",
      goods: "/goods",
      neighbors: "/neighbors"
    };

    // Navigate to the appropriate page
    navigate(routeMap[type]);

    // Dispatch an event that the target page will listen for
    const event = new CustomEvent('highlightItem', {
      detail: {
        type,
        id,
      }
    });
    
    // Small delay to ensure navigation completes first
    setTimeout(() => {
      window.dispatchEvent(event);
    }, 100);

    // Refresh notifications after taking action
    refetch();
  };

  const handleArchive = async (e: React.MouseEvent, notificationId: string) => {
    e.stopPropagation();
    await archiveNotification(notificationId);
    refetch();
  };

  return (
    <section>
      {/* Section header with archive toggle button */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-bold text-gray-900">Notifications</h2>
        <Button 
          variant="outline" 
          size="sm" 
          className="flex items-center" 
          onClick={() => setShowArchived(!showArchived)}
        >
          <Archive className="h-4 w-4 mr-2" />
          {showArchived ? "Show Active" : "Show Archived"}
        </Button>
      </div>
      
      {/* Notification list container */}
      <div className="bg-white rounded-lg shadow-sm p-4 h-[600px] px-0 py-[3px]">
        <ScrollArea className="h-[550px]">
          {notifications?.length ? (
            <div className="space-y-1">
              {notifications.map(notification => (
                <NotificationItem
                  key={notification.id}
                  title={notification.title}
                  type={notification.type}
                  itemId={notification.id}
                  isRead={notification.is_read}
                  isArchived={notification.is_archived}
                  onClose={() => refetch()}
                  onArchive={(e) => handleArchive(e, notification.id)}
                  onItemClick={handleItemClick}
                  context={notification.context}
                />
              ))}
            </div>
          ) : (
            <div className="flex items-center justify-center h-full">
              <p className="text-gray-500">
                {showArchived ? "No archived notifications" : "No new notifications"}
              </p>
            </div>
          )}
        </ScrollArea>
      </div>
    </section>
  );
};

export default NotificationsSection;
