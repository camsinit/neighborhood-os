
import { LucideIcon } from "lucide-react";
import ModuleButton from "./module-button";

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  actionLabel: string;
  onAction: () => void;
  moduleTheme: 'calendar' | 'skills' | 'goods' | 'safety' | 'neighbors';
  className?: string;
}

/**
 * Enhanced EmptyState component with module-specific theming
 * 
 * Now uses a non-clickable container with a separate ModuleButton for actions.
 * This makes it clear that the empty state itself is informational,
 * while the action button is the interactive element.
 */
const EmptyState = ({
  icon: Icon,
  title,
  description,
  actionLabel,
  onAction,
  moduleTheme,
  className = ""
}: EmptyStateProps) => {
  return (
    <div className={`max-w-4xl mx-auto mt-8 ${className}`}>
      {/* Non-clickable informational container */}
      <div className="w-full p-8 border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center gap-4 bg-gray-50/50">
        <Icon className="h-8 w-8 text-gray-400" />
        <div className="flex flex-col items-center text-center">
          <p className="text-lg font-medium text-gray-900">{title}</p>
          <p className="text-sm text-gray-500 mt-1 mb-4">{description}</p>
        </div>
        
        {/* Separate action button with proper module theming */}
        <ModuleButton
          onClick={onAction}
          moduleTheme={moduleTheme}
          variant="filled"
          size="sm"
        >
          {actionLabel}
        </ModuleButton>
      </div>
    </div>
  );
};

export default EmptyState;
