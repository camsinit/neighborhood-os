
/**
 * AIInputWithSuggestions Component
 * 
 * An enhanced input component for AI interactions with suggested actions.
 * This component provides:
 * - Auto-resizing textarea for user input
 * - Customizable action buttons with icons
 * - Visual feedback for selected actions
 */
"use client";

import { useState } from "react";
import { CornerRightDown } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { useAutoResizeTextarea } from "@/components/hooks/use-auto-resize-textarea";
import { ActionButtons } from "./ai-input/action-buttons";
import { SelectedAction } from "./ai-input/selected-action";
import { DEFAULT_ACTIONS } from "./ai-input/default-actions";
import { AIInputWithSuggestionsProps } from "./ai-input/types";

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
    // State for the input value and selected action
    const [inputValue, setInputValue] = useState("");
    const [selectedItem, setSelectedItem] = useState<string | null>(defaultSelected ?? null);

    // Use our custom hook for auto-resizing the textarea
    const { textareaRef, adjustHeight } = useAutoResizeTextarea({
        minHeight,
        maxHeight,
    });

    // Toggle selection of an action item
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
        <div className={cn("w-full py-4", className)}>
            <div className="relative max-w-xl w-full mx-auto">
                <div className="relative border border-black/10 dark:border-white/10 focus-within:border-black/20 dark:focus-within:border-white/20 rounded-2xl bg-black/[0.03] dark:bg-white/[0.03]">
                    <div className="flex flex-col">
                        {/* Input area */}
                        <div
                            className="overflow-y-auto"
                            style={{ maxHeight: `${maxHeight - 48}px` }}
                        >
                            <Textarea
                                ref={textareaRef}
                                id={id}
                                placeholder={placeholder}
                                className={cn(
                                    "max-w-xl w-full rounded-2xl pr-10 pt-3 pb-3 placeholder:text-black/70 dark:placeholder:text-white/70 border-none focus:ring text-black dark:text-white resize-none text-wrap bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 leading-[1.2]",
                                    `min-h-[${minHeight}px]`
                                )}
                                value={inputValue}
                                disabled={isLoading}
                                onChange={(e) => {
                                    setInputValue(e.target.value);
                                    adjustHeight();
                                }}
                                onKeyDown={(e) => {
                                    if (e.key === "Enter" && !e.shiftKey) {
                                        e.preventDefault();
                                        handleSubmit();
                                    }
                                }}
                            />
                        </div>

                        {/* Area for the selected action chip */}
                        <div className="h-12 bg-transparent">
                            <SelectedAction 
                                currentItem={currentItem}
                                selectedItem={selectedItem}
                                handleSubmit={handleSubmit}
                                isLoading={isLoading}
                            />
                        </div>
                    </div>

                    {/* Submit button */}
                    <button 
                        onClick={handleSubmit}
                        disabled={inputValue.trim() === '' || isLoading}
                        className="absolute right-3 top-3 disabled:opacity-30"
                    >
                        <CornerRightDown
                            className={cn(
                                "w-4 h-4 transition-all duration-200 dark:text-white",
                                inputValue
                                    ? "opacity-100 scale-100"
                                    : "opacity-30 scale-95"
                            )}
                        />
                    </button>
                </div>
            </div>
            
            {/* Action buttons below the input */}
            <ActionButtons 
                actions={actions} 
                selectedItem={selectedItem}
                toggleItem={toggleItem}
                isLoading={isLoading}
            />
        </div>
    );
}
