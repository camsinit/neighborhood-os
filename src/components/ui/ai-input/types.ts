
// Add compactMode prop to the AIInputWithSuggestionsProps interface
import { LucideIcon } from "lucide-react";

export interface ActionItem {
  text: string;
  icon: LucideIcon;
  colors: {
    bg: string;
    border: string;
    icon: string;
  };
}

export interface AIInputWithSuggestionsProps {
  id?: string;
  placeholder?: string;
  minHeight?: number;
  maxHeight?: number;
  actions?: ActionItem[];
  defaultSelected?: string;
  onSubmit?: (value: string, actionType?: string) => void;
  className?: string;
  isLoading?: boolean;
  compactMode?: boolean; // Added new property for compact mode
}
