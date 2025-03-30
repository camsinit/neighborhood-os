
/**
 * AIInputWithSuggestions Component
 * 
 * Main input component that allows users to type text, select AI actions,
 * and submit their queries to the AI assistant.
 */
import { useState } from "react";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { useAutoResizeTextarea } from "@/components/hooks/use-auto-resize-textarea";
import { CornerRightDown, Loader2 } from "lucide-react"; 
import { DEFAULT_ACTIONS } from "./ai-input/default-actions";
import { ActionButtons } from "./ai-input/action-buttons";
import { SelectedAction } from "./ai-input/selected-action";
import { AIInputWithSuggestionsProps } from "./ai-input/types";

/**
 * Main component that provides an input area with suggestion buttons
 */
export function AIInputWithSuggestions({
    id = "ai-input-with-actions",
    placeholder = "Enter your text here...",
    minHeight = 64,
    maxHeight = 200,
    actions = DEFAULT_ACTIONS,
    defaultSelected,
    onSubmit,
    className,
    isLoading = false
}: AIInputWithSuggestionsProps) {
    // State management for the input and selected action
    const [inputValue, setInputValue] = useState("");
    const [selectedItem, setSelectedItem] = useState<string | null>(defaultSelected ?? null);

    // Hook for auto-resizing textarea
    const { textareaRef, adjustHeight } = useAutoResizeTextarea({
        minHeight,
        maxHeight,
    });

    // Toggle the selected action item
    const toggleItem = (itemText: string) => {
        setSelectedItem((prev) => (prev === itemText ? null : itemText));
    };

    // Find the currently selected action item
    const currentItem = selectedItem
        ? actions.find((item) => item.text === selectedItem)
        : null;

    // Handle form submission
    const handleSubmit = () => {
        if (inputValue.trim() && !isLoading) {
            onSubmit?.(inputValue, selectedItem ?? undefined);
            setInputValue("");
            setSelectedItem(null);
            adjustHeight(true);
        }
    };

    return (
        <div className={cn("w-full py-2", className)}>
            <div className="w-full mx-auto">
                <div className="relative w-full border border-black/10 dark:border-white/10 focus-within:border-black/20 dark:focus-within:border-white/20 rounded-2xl bg-black/[0.03] dark:bg-white/[0.03]">
                    <div className="flex flex-col">
                        <div
                            className="overflow-y-auto"
                            style={{ maxHeight: `${maxHeight - 48}px` }}
                        >
                            <Textarea
                                ref={textareaRef}
                                id={id}
                                placeholder={placeholder}
                                disabled={isLoading}
                                className={cn(
                                    "w-full rounded-2xl pr-10 pt-3 pb-3 placeholder:text-black/70 dark:placeholder:text-white/70 border-none focus:ring text-black dark:text-white resize-none text-wrap bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 leading-[1.2]",
                                    `min-h-[${minHeight}px]`
                                )}
                                value={inputValue}
                                onChange={(e) => {
                                    setInputValue(e.target.value);
                                    adjustHeight();
                                }}
                                onKeyDown={(e) => {
                                    if (e.key === "Enter" && !e.shiftKey && !isLoading) {
                                        e.preventDefault();
                                        handleSubmit();
                                    }
                                }}
                            />
                        </div>

                        <div className="h-12 bg-transparent">
                            <SelectedAction
                                currentItem={currentItem}
                                selectedItem={selectedItem}
                                handleSubmit={handleSubmit}
                                isLoading={isLoading}
                            />
                        </div>
                    </div>

                    {isLoading ? (
                        <Loader2 className="absolute right-3 top-3 w-4 h-4 animate-spin text-gray-500" />
                    ) : (
                        <CornerRightDown
                            className={cn(
                                "absolute right-3 top-3 w-4 h-4 transition-all duration-200 dark:text-white",
                                inputValue
                                    ? "opacity-100 scale-100"
                                    : "opacity-30 scale-95"
                            )}
                            onClick={handleSubmit}
                        />
                    )}
                </div>
            </div>
            
            <ActionButtons 
                actions={actions}
                selectedItem={selectedItem}
                toggleItem={toggleItem}
                isLoading={isLoading}
            />
        </div>
    );
}
