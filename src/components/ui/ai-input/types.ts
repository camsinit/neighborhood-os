
/**
 * Type definitions for the AI Input Components
 * 
 * These types are shared between the various components that make up
 * the AI input with suggestions functionality.
 */
import { LucideIcon } from "lucide-react";

/**
 * Defines the structure for action items (buttons below the textarea)
 * Each action has text, an icon, and color settings
 */
export interface ActionItem {
    text: string;
    icon: LucideIcon;
    colors: {
        icon: string;
        border: string;
        bg: string;
    };
}

/**
 * Props for the main AIInputWithSuggestions component
 */
export interface AIInputWithSuggestionsProps {
    id?: string;
    placeholder?: string;
    minHeight?: number;
    maxHeight?: number;
    actions?: ActionItem[];
    defaultSelected?: string;
    onSubmit?: (text: string, action?: string) => void;
    className?: string;
    isLoading?: boolean;
}
