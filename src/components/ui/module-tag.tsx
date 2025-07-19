import React from 'react';
import { getModuleThemeColor } from "@/theme/moduleTheme";

/**
 * ModuleTag Component
 * 
 * A tag/badge component that automatically applies the appropriate theme colors
 * based on the module it belongs to. Perfect for toggle items, tags, badges, etc.
 * 
 * @param moduleTheme - The theme of the module this tag belongs to
 * @param variant - Tag variant (filled, outline, or pastel)
 * @param selected - Whether the tag is in a selected state
 */
interface ModuleTagProps extends React.HTMLAttributes<HTMLDivElement> {
  moduleTheme: 'calendar' | 'skills' | 'goods' | 'safety' | 'neighbors';
  variant?: 'filled' | 'outline' | 'pastel';
  selected?: boolean;
  children: React.ReactNode;
}

const ModuleTag = ({ 
  moduleTheme, 
  variant = 'pastel',
  selected = false,
  className,
  children,
  ...props 
}: ModuleTagProps) => {
  // Get the appropriate theme color
  const themeColor = getModuleThemeColor(moduleTheme);
  const lightThemeColor = getModuleThemeColor(moduleTheme, 'light');
  
  // Create style based on variant and selected state
  let style;
  
  if (selected) {
    // When selected, always use filled style regardless of variant
    style = { 
      backgroundColor: themeColor, 
      color: 'white', 
      borderColor: themeColor 
    };
  } else {
    switch (variant) {
      case 'filled':
        style = { 
          backgroundColor: themeColor, 
          color: 'white', 
          borderColor: themeColor 
        };
        break;
      
      case 'outline':
        style = { 
          backgroundColor: 'transparent', 
          color: themeColor, 
          borderColor: themeColor 
        };
        break;
        
      case 'pastel':
      default:
        // Pastel variant with light background and colored text
        style = { 
          backgroundColor: lightThemeColor,
          color: themeColor,
          borderColor: `${themeColor}30` // 30% opacity border
        };
        break;
    }
  }
  
  return (
    <div
      className={`px-3 py-2 rounded-full border transition-colors text-sm min-w-fit hover:opacity-80 ${className}`}
      style={style}
      {...props}
    >
      {children}
    </div>
  );
};

export default ModuleTag;