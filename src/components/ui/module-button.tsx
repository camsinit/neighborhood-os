
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

/**
 * ModuleButton uses the theme colors from moduleTheme.ts to ensure
 * all buttons within a module have consistent colors.
 * 
 * Three variants are available:
 * - filled: Full color background with white text
 * - outline: Transparent with colored border and text
 * - pastel: Light version of the color for subtle actions
 */
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
      // Outline button with theme-colored border and text
      style = { 
        backgroundColor: 'transparent', 
        color: themeColor, 
        borderColor: themeColor,
        borderWidth: '1px' // Ensure border is visible
      };
      break;
      
    case 'pastel':
      // Pastel variant with light background and darker text
      style = { 
        backgroundColor: lightThemeColor,
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
      className={`hover:opacity-90 transition-all duration-200 ${className}`}
      style={style}
      {...props}
    />
  );
};

export default ModuleButton;
