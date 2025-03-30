
/**
 * Default Actions
 * 
 * This file defines the default action buttons that appear below the input
 * when no custom actions are provided.
 */
import { Text, CheckCheck, ArrowDownWideNarrow } from "lucide-react";
import { ActionItem } from "./types";

/**
 * Default action buttons that appear below the input when no custom actions are provided
 */
export const DEFAULT_ACTIONS: ActionItem[] = [
    {
        text: "Summary",
        icon: Text,
        colors: {
            icon: "text-orange-600",
            border: "border-orange-500",
            bg: "bg-orange-100",
        },
    },
    {
        text: "Fix Spelling and Grammar",
        icon: CheckCheck,
        colors: {
            icon: "text-emerald-600",
            border: "border-emerald-500",
            bg: "bg-emerald-100",
        },
    },
    {
        text: "Make shorter",
        icon: ArrowDownWideNarrow,
        colors: {
            icon: "text-purple-600",
            border: "border-purple-500",
            bg: "bg-purple-100",
        },
    },
];
