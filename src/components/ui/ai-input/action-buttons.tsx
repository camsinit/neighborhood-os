
/**
 * ActionButtons Component
 * 
 * Component that displays selectable action buttons below the input field.
 * These buttons allow users to quickly specify the type of query they're making.
 */
import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";

// Props interface for ActionButtons component
interface ActionButtonsProps {
  actions: Array<{
    text: string;
    icon: LucideIcon;
    colors: {
      bg: string;
      border: string;
      icon: string;
    };
  }>;
  selectedItem: string | null;
  toggleItem: (itemText: string) => void;
  isLoading: boolean;
  compactMode?: boolean; // Added compact mode prop
}

/**
 * Component that displays selectable action buttons below the input field
 * Aligned to the left side for better visual hierarchy
 */
export function ActionButtons({
  actions,
  selectedItem,
  toggleItem,
  isLoading,
  compactMode = false,
}: ActionButtonsProps) {
  // If no actions are provided, don't render anything
  if (actions.length === 0) return null;

  return (
    <div className={cn(
      "flex flex-wrap gap-2 justify-start",
      // Reduced top margin in compact mode
      compactMode ? "mt-1" : "mt-2"
    )}>
      {actions.map((action) => {
        const isSelected = selectedItem === action.text;
        
        return (
          <button
            key={action.text}
            onClick={() => toggleItem(action.text)}
            disabled={isLoading}
            className={cn(
              "inline-flex items-center text-xs font-medium rounded-full border transition-colors duration-200 ease-in-out",
              // Smaller padding in compact mode
              compactMode ? "px-2 py-1" : "px-3 py-1.5",
              isSelected
                ? `${action.colors.bg} ${action.colors.border}`
                : "border-gray-200 bg-black/[0.03] dark:bg-white/[0.03]", // Updated to use gray-200 instead of black/10
              isLoading && "opacity-50 cursor-not-allowed"
            )}
          >
            <action.icon
              className={cn(
                "mr-1 h-3.5 w-3.5",
                isSelected ? action.colors.icon : "text-black dark:text-white"
              )}
            />
            <span>{action.text}</span>
          </button>
        );
      })}
    </div>
  );
}
