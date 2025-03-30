
import { AIAction } from "./types";
import { cn } from "@/lib/utils";

// Props interface for ActionButtons component
interface ActionButtonsProps {
  actions: AIAction[];
  selectedItem: string | null;
  toggleItem: (itemText: string) => void;
  isLoading: boolean;
}

/**
 * Component that displays selectable action buttons below the input field
 * Updated to align buttons to the left side
 */
export function ActionButtons({
  actions,
  selectedItem,
  toggleItem,
  isLoading,
}: ActionButtonsProps) {
  // If no actions are provided, don't render anything
  if (actions.length === 0) return null;

  return (
    <div className="mt-2 flex flex-wrap gap-2 justify-start">
      {actions.map((action) => {
        const isSelected = selectedItem === action.text;
        
        return (
          <button
            key={action.text}
            onClick={() => toggleItem(action.text)}
            disabled={isLoading}
            className={cn(
              "inline-flex items-center text-xs font-medium rounded-full px-3 py-1.5 border transition-colors duration-200 ease-in-out",
              isSelected
                ? `${action.colors.bg} ${action.colors.border}`
                : "border-black/10 dark:border-white/10 bg-black/[0.03] dark:bg-white/[0.03]",
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
