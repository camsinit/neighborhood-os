
import React from 'react';
import { Button, ButtonProps } from "@/components/ui/button";
import { getModuleThemeColor } from "@/theme/moduleTheme";

/**
 * ModuleButton Component
 * 
 * A button component that automatically applies the appropriate theme colors
 * based on the module it belongs to.
 * 
 * @param moduleTheme - The theme of the module this button belongs to
 * @param variant - Button variant (filled, outline, or pastel)
 */
interface ModuleButtonProps extends Omit<ButtonProps, 'variant'> {
  moduleTheme: 'calendar' | 'skills' | 'goods' | 'safety' | 'neighbors';
  variant?: 'filled' | 'outline' | 'pastel';
}

const ModuleButton = ({ 
  moduleTheme, 
  variant = 'filled',
  className,
  ...props 
}: ModuleButtonProps) => {
  // Get the appropriate theme color
  const themeColor = getModuleThemeColor(moduleTheme);
  const lightThemeColor = getModuleThemeColor(moduleTheme, 'light');
  
  // Create style based on variant
  let style;
  
  switch (variant) {
    case 'filled':
      // Standard filled button with full saturation
      style = { 
        backgroundColor: themeColor, 
        color: 'white', 
        borderColor: 'transparent' 
      };
      break;
    
    case 'outline':
      // Outline button with colored border
      style = { 
        backgroundColor: 'transparent', 
        color: themeColor, 
        borderColor: themeColor 
      };
      break;
      
    case 'pastel':
      // New pastel variant with less saturation - using light theme colors with darker text
      style = { 
        backgroundColor: lightThemeColor,
        // Use a darker shade of the theme color for text to maintain contrast
        color: themeColor,
        borderColor: 'transparent'
      };
      break;
      
    default:
      style = { 
        backgroundColor: themeColor, 
        color: 'white', 
        borderColor: 'transparent' 
      };
  }
  
  return (
    <Button
      className={`hover:opacity-90 ${className}`}
      style={style}
      {...props}
    />
  );
};

export default ModuleButton;
