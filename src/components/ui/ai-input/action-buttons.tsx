
/**
 * ActionButtons Component
 * 
 * This component renders the suggestion buttons that appear below the input area.
 * Users can click these buttons to select different AI actions.
 */
import { cn } from "@/lib/utils";
import { ActionItem } from "./types";

interface ActionButtonsProps {
    actions: ActionItem[];
    selectedItem: string | null;
    toggleItem: (text: string) => void;
    isLoading?: boolean;
}

/**
 * Renders the action buttons below the text input
 * Shows all actions except the currently selected one
 */
export function ActionButtons({ 
    actions, 
    selectedItem, 
    toggleItem,
    isLoading = false
}: ActionButtonsProps) {
    return (
        <div className="flex flex-wrap gap-1.5 mt-2 max-w-xl mx-auto justify-start px-4">
            {actions.filter((item) => item.text !== selectedItem).map(
                ({ text, icon: Icon, colors }) => (
                    <button
                        type="button"
                        key={text}
                        disabled={isLoading}
                        className={cn(
                            "px-3 py-1.5 text-xs font-medium rounded-full",
                            "border transition-all duration-200",
                            "border-black/10 dark:border-white/10 bg-white dark:bg-gray-900 hover:bg-black/5 dark:hover:bg-white/5",
                            "flex-shrink-0"
                        )}
                        onClick={() => toggleItem(text)}
                    >
                        <div className="flex items-center gap-1.5">
                            <Icon className={cn("h-4 w-4", colors.icon)} />
                            <span className="text-black/70 dark:text-white/70 whitespace-nowrap">
                                {text}
                            </span>
                        </div>
                    </button>
                )
            )}
        </div>
    );
}
