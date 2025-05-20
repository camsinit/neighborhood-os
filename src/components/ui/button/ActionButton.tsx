
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
import { ModuleThemeColor } from '@/types/module';

// Module theme colors for buttons
export type ActionButtonTheme = 'calendar' | 'skills' | 'goods' | 'safety' | 'care' | 'neighbors' | 'default' | 'gray';

/**
 * Color mapping for each theme 
 * - Each theme uses the moduleThemeColors to ensure consistency across the app
 * - We've added a 'gray' theme for use on the homepage or non-module contexts
 */
const themeColors: Record<ActionButtonTheme, string> = {
  // Module-specific themes using moduleThemeColors to maintain consistency
  calendar: 'bg-[#0EA5E9] hover:bg-[#0893D1] text-white shadow-sm',
  skills: 'bg-[#22C55E] hover:bg-[#1FA84F] text-white shadow-sm',
  goods: 'bg-[#F97316] hover:bg-[#EA6104] text-white shadow-sm',
  safety: 'bg-[#EA384C] hover:bg-[#D31F32] text-white shadow-sm',
  care: 'bg-[#EC4899] hover:bg-[#DB2777] text-white shadow-sm',
  neighbors: 'bg-[#7E69AB] hover:bg-[#6A5696] text-white shadow-sm',
  // Default theme uses the primary color from the theme
  default: 'bg-primary hover:bg-primary/90 text-primary-foreground shadow-sm',
  // Gray theme for buttons on homepage or non-module contexts
  gray: 'bg-[#F1F1F1] hover:bg-[#E1E1E1] text-gray-700 border border-gray-200 shadow-sm'
};

// Props for the Action Button
export interface ActionButtonProps extends Omit<ButtonProps, 'theme'> {
  theme?: ActionButtonTheme;
  icon?: LucideIcon;
  children: React.ReactNode;
  outline?: boolean; // New prop to enable outline style
}

/**
 * ActionButton component for consistent styled buttons across the app
 * 
 * This button:
 * - Applies consistent theme-based styling
 * - Handles icons consistently
 * - Provides good hover/focus states
 * - Now supports outline variant
 */
const ActionButton = ({
  theme = 'default',
  icon: Icon,
  className,
  children,
  outline = false, // Default to filled style
  ...props
}: ActionButtonProps) => {
  // Get the theme color
  const themeColor = theme as keyof typeof moduleThemeColors;
  
  // Calculate the styles based on outline prop
  let buttonStyle = themeColors[theme];
  
  // If outline is true, override the style with an outline style
  if (outline && theme !== 'gray' && theme !== 'default') {
    // Get the appropriate module color if this is a module theme
    const moduleColor = moduleThemeColors[themeColor as ModuleThemeColor]?.primary || null;
    
    if (moduleColor) {
      buttonStyle = `bg-transparent text-[${moduleColor}] border border-[${moduleColor}] hover:bg-[${moduleColor}]/10 shadow-sm`;
    }
  }

  return (
    <Button
      className={cn(
        // Apply theme-based styling
        buttonStyle,
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
