
/**
 * SelectedAction Component
 * 
 * This component displays the currently selected action as a small chip
 * in the bottom left corner of the input area.
 */
import { cn } from "@/lib/utils";
import { ActionItem } from "./types";

interface SelectedActionProps {
    currentItem: ActionItem | null;
    selectedItem: string | null;
    handleSubmit: () => void;
    isLoading?: boolean;
}

/**
 * Displays the currently selected action as a chip/badge
 * in the bottom-left corner of the input area
 */
export function SelectedAction({ 
    currentItem, 
    selectedItem,
    handleSubmit,
    isLoading = false
}: SelectedActionProps) {
    if (!currentItem) return null;
    
    return (
        <div className="absolute left-3 bottom-3 z-10">
            <button
                type="button"
                onClick={handleSubmit}
                disabled={isLoading}
                className={cn(
                    "inline-flex items-center gap-1.5",
                    "border shadow-sm rounded-md px-2 py-0.5 text-xs font-medium",
                    "animate-fadeIn hover:bg-black/5 dark:hover:bg-white/5 transition-colors duration-200",
                    currentItem.colors.bg,
                    currentItem.colors.border
                )}
            >
                <currentItem.icon
                    className={`w-3.5 h-3.5 ${currentItem.colors.icon}`}
                />
                <span
                    className={currentItem.colors.icon}
                >
                    {selectedItem}
                </span>
            </button>
        </div>
    );
}
