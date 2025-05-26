
/**
 * NotificationDensityControl - Toggle between compact and comfortable view modes
 * 
 * This component allows users to choose their preferred notification density:
 * - Compact: Shows 3x more notifications in the same space
 * - Comfortable: Original spacing for easier reading
 */
import React from "react";
import { Button } from "@/components/ui/button";
import { LayoutGrid, List } from "lucide-react";
import { cn } from "@/lib/utils";

export type NotificationDensity = "compact" | "comfortable";

interface NotificationDensityControlProps {
  density: NotificationDensity;
  onDensityChange: (density: NotificationDensity) => void;
  className?: string;
}

/**
 * Component for controlling notification display density
 */
const NotificationDensityControl: React.FC<NotificationDensityControlProps> = ({
  density,
  onDensityChange,
  className
}) => {
  return (
    <div className={cn("flex items-center gap-1", className)}>
      <Button
        variant={density === "comfortable" ? "default" : "ghost"}
        size="sm"
        onClick={() => onDensityChange("comfortable")}
        className="h-7 px-2"
      >
        <LayoutGrid className="h-3 w-3" />
        <span className="sr-only">Comfortable view</span>
      </Button>
      
      <Button
        variant={density === "compact" ? "default" : "ghost"}
        size="sm"
        onClick={() => onDensityChange("compact")}
        className="h-7 px-2"
      >
        <List className="h-3 w-3" />
        <span className="sr-only">Compact view</span>
      </Button>
    </div>
  );
};

export default NotificationDensityControl;
