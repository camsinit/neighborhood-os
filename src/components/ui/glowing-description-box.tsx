
import React from 'react';
import { cn } from "@/lib/utils";

/**
 * GlowingDescriptionBox Component
 * 
 * This component renders a description box with a glowing effect using the specified theme color.
 * It's used across different pages to maintain a consistent UI with page-specific theme colors.
 * 
 * @param children - The content to display inside the description box
 * @param colorClass - CSS variable name for the theme color (e.g., "calendar-color", "safety-color")
 * @param className - Optional additional classes to apply
 */
interface GlowingDescriptionBoxProps {
  children: React.ReactNode;
  colorClass: string;
  className?: string;
}

const GlowingDescriptionBox = ({ 
  children, 
  colorClass,
  className 
}: GlowingDescriptionBoxProps) => {
  // Using !important to ensure our styles are applied
  // Adding console.log to verify the component is rendering with the correct colorClass
  console.log(`Rendering GlowingDescriptionBox with color: ${colorClass}`);
  
  return (
    <div className="relative my-4">
      {/* Debugging: Add a data attribute to identify this element in the DOM */}
      <div 
        className="absolute inset-0 blur-[25px] opacity-50 rounded-lg -z-10"
        style={{ 
          backgroundColor: `hsl(var(--${colorClass})) !important`,
          transform: 'scale(0.95)' 
        }}
        data-glow="outer"
      />
      
      {/* Second glow layer */}
      <div 
        className="absolute inset-0 blur-[12px] opacity-40 rounded-lg -z-10"
        style={{ 
          backgroundColor: `hsl(var(--${colorClass})) !important`,
          transform: 'scale(0.98)' 
        }}
        data-glow="inner"
      />
      
      {/* Main content box */}
      <div 
        className={cn(
          "bg-white rounded-lg p-4 shadow-md relative z-10",
          className
        )}
        data-description-box="true"
      >
        {children}
      </div>
    </div>
  );
};

export default GlowingDescriptionBox;
