
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
  return (
    <div className="relative">
      {/* Glowing shadow effect behind the box */}
      <div 
        className="absolute inset-0 blur-[15px] opacity-30 rounded-lg -z-10"
        style={{ 
          backgroundColor: `hsl(var(--${colorClass}))`,
          transform: 'scale(0.95)' 
        }}
      />
      
      {/* Main content box with shadow */}
      <div className={cn(
        "bg-white rounded-lg p-4 mt-2 mb-6 shadow-md relative z-10",
        className
      )}>
        {children}
      </div>
    </div>
  );
};

export default GlowingDescriptionBox;
