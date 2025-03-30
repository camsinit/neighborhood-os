
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
  routeMap
} from "@/utils/highlightNavigation";
import { useRef } from "react";

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
  const handleViewClick = () => {
    // Close the popover
    if (popoverRef.current) {
      // Simulate a click on the trigger to close the popover
      popoverRef.current.click();
    }
    
    // Get the route for this item type
    const route = routeMap[type];
    
    // Navigate to the page
    navigate(route);
    
    // After navigation, highlight the item
    setTimeout(() => {
      highlightItem(type, itemId, true);
    }, 100);
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
                  if (popoverRef.current) popoverRef.current.click();
                  onAction();
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
