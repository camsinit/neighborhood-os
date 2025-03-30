
/**
 * NotificationPopover Component
 * 
 * A simple popover that shows notification details and provides
 * action buttons, including a "View" button to navigate to the item
 */
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { 
  Popover, 
  PopoverContent, 
  PopoverTrigger 
} from "@/components/ui/popover";
import { 
  HighlightableItemType, 
  highlightItem,
  routeMap,
  readableTypeNames
} from "@/utils/highlightNavigation";
import { useRef } from "react";
import { toast } from "@/hooks/use-toast";

interface NotificationPopoverProps {
  children: React.ReactNode;
  title: string;
  type: HighlightableItemType;
  itemId: string;
  description?: string;
  isArchived?: boolean;
  onAction?: () => void;
  actionLabel?: string;
}

/**
 * NotificationPopover wraps content in a popover with navigation options
 */
const NotificationPopover = ({
  children,
  title,
  type,
  itemId,
  description,
  isArchived,
  onAction,
  actionLabel = "Take Action"
}: NotificationPopoverProps) => {
  const navigate = useNavigate();
  const popoverRef = useRef<HTMLButtonElement>(null);
  
  // Function to navigate to the item page and highlight it
  const handleViewClick = async () => {
    try {
      // Close the popover
      if (popoverRef.current) {
        // Simulate a click on the trigger to close the popover
        popoverRef.current.click();
      }
      
      // Get the route for this item type
      const route = routeMap[type];
      
      // Show a toast to inform the user
      toast({
        title: `Finding ${readableTypeNames[type]}`,
        description: "Navigating to the requested item...",
        duration: 3000,
      });
      
      // Navigate to the page
      navigate(route);
      
      // After navigation, highlight the item
      setTimeout(async () => {
        // Attempt to highlight the item with error handling
        const result = await highlightItem(type, itemId, false);
        
        // If highlighting failed, show error toast
        if (!result) {
          console.warn(`[NotificationPopover] Failed to highlight ${type} with ID ${itemId}`);
          
          toast({
            title: `${readableTypeNames[type]} Not Found`,
            description: "The item may have been removed or is unavailable.",
            variant: "destructive",
            duration: 5000,
          });
        }
      }, 300);
    } catch (error) {
      console.error("[NotificationPopover] Error during navigation:", error);
      
      toast({
        title: "Navigation Error",
        description: "There was a problem locating the requested item.",
        variant: "destructive",
      });
    }
  };
  
  return (
    <Popover>
      <PopoverTrigger ref={popoverRef} asChild>
        {children}
      </PopoverTrigger>
      <PopoverContent className="w-80">
        <div className="space-y-2">
          <h4 className="font-medium text-lg">{title}</h4>
          
          {description && (
            <p className="text-sm text-muted-foreground">{description}</p>
          )}
          
          <div className="flex justify-between pt-2">
            {!isArchived && onAction && (
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => {
                  try {
                    if (popoverRef.current) popoverRef.current.click();
                    onAction();
                  } catch (error) {
                    console.error("[NotificationPopover] Error during action:", error);
                    toast({
                      title: "Action Error",
                      description: "There was a problem performing the requested action.",
                      variant: "destructive",
                    });
                  }
                }}
              >
                {actionLabel}
              </Button>
            )}
            
            <Button 
              variant="default" 
              size="sm" 
              onClick={handleViewClick}
            >
              View
            </Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default NotificationPopover;
