
/**
 * ActionButton.tsx
 * 
 * A specialized button component for consistent action buttons throughout the app
 */
import React from 'react';
import { Button, ButtonProps } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { LucideIcon } from 'lucide-react';
import { moduleThemeColors } from '@/theme/moduleTheme';

// Module theme colors for buttons
export type ActionButtonTheme = 'calendar' | 'skills' | 'goods' | 'safety' | 'care' | 'neighbors' | 'default';

// Color mapping for each theme - now directly using the moduleThemeColors
const themeColors: Record<ActionButtonTheme, string> = {
  calendar: 'bg-[#0EA5E9] hover:bg-[#0893D1] text-white',
  skills: 'bg-[#22C55E] hover:bg-[#1FA84F] text-white',
  goods: 'bg-[#F97316] hover:bg-[#EA6104] text-white',
  safety: 'bg-[#EA384C] hover:bg-[#D31F32] text-white',
  care: 'bg-[#EC4899] hover:bg-[#DB2777] text-white',
  neighbors: 'bg-[#7E69AB] hover:bg-[#6A5696] text-white',
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
