
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
 * @param variant - Button variant (filled or outline)
 */
interface ModuleButtonProps extends Omit<ButtonProps, 'variant'> {
  moduleTheme: 'calendar' | 'skills' | 'goods' | 'safety' | 'care' | 'neighbors';
  variant?: 'filled' | 'outline';
}

const ModuleButton = ({ 
  moduleTheme, 
  variant = 'filled',
  className,
  ...props 
}: ModuleButtonProps) => {
  // Get the appropriate theme color
  const themeColor = getModuleThemeColor(moduleTheme);
  
  // Create style based on variant
  const style = variant === 'filled' 
    ? { backgroundColor: themeColor, color: 'white', borderColor: 'transparent' } 
    : { backgroundColor: 'transparent', color: themeColor, borderColor: themeColor };
  
  return (
    <Button
      className={`hover:opacity-90 ${className}`}
      style={style}
      {...props}
    />
  );
};

export default ModuleButton;
