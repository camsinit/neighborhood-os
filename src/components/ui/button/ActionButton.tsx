
/**
 * ActionButton.tsx
 * 
 * A specialized button component for consistent action buttons throughout the app
 */
import React from 'react';
import { Button, ButtonProps } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { LucideIcon } from 'lucide-react';

// Module theme colors for buttons
export type ActionButtonTheme = 'calendar' | 'skills' | 'goods' | 'safety' | 'care' | 'neighbors' | 'default';

// Color mapping for each theme
const themeColors: Record<ActionButtonTheme, string> = {
  calendar: 'bg-[#4FD1C5] hover:bg-[#38B2AC] text-white',
  skills: 'bg-[#6366F1] hover:bg-[#4F46E5] text-white',
  goods: 'bg-[#F59E0B] hover:bg-[#D97706] text-white',
  safety: 'bg-[#EF4444] hover:bg-[#DC2626] text-white',
  care: 'bg-[#EC4899] hover:bg-[#DB2777] text-white',
  neighbors: 'bg-[#10B981] hover:bg-[#059669] text-white',
  default: 'bg-primary hover:bg-primary/90 text-primary-foreground'
};

// Props for the Action Button
export interface ActionButtonProps extends Omit<ButtonProps, 'theme'> {
  theme?: ActionButtonTheme;
  icon?: LucideIcon;
  children: React.ReactNode;
}

/**
 * ActionButton component for consistent styled buttons across the app
 * 
 * This button:
 * - Applies consistent theme-based styling
 * - Handles icons consistently
 * - Provides good hover/focus states
 */
const ActionButton = ({
  theme = 'default',
  icon: Icon,
  className,
  children,
  ...props
}: ActionButtonProps) => {
  return (
    <Button
      className={cn(
        // Apply theme-based styling
        themeColors[theme],
        // Consistent transition for all buttons
        "transition-all duration-200",
        // Override any provided classes
        className
      )}
      {...props}
    >
      {/* Show icon if provided */}
      {Icon && <Icon className="w-4 h-4 mr-2" />}
      {children}
    </Button>
  );
};

export default ActionButton;
