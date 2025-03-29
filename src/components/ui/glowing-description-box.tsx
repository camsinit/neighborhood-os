
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
  // Using a simple console log to verify the component is rendering with the correct colorClass
  console.log(`Rendering GlowingDescriptionBox with color: ${colorClass}`);
  
  return (
    <div className="relative my-6">
      {/* 
        First glow layer - outer diffuse glow
        We use absolute positioning with inset-0 to cover the entire parent div
        The blur effect creates the soft glow
        We use -z-10 to position it behind the content
      */}
      <div 
        className="absolute inset-0 blur-[25px] opacity-60 rounded-lg -z-10"
        style={{ 
          // We directly use the CSS variable with the color class passed in props
          backgroundColor: `hsl(var(--${colorClass}))`, 
          // Slightly scaling down creates a better glow effect
          transform: 'scale(0.95)' 
        }}
        data-glow="outer"
      />
      
      {/* 
        Second glow layer - more focused inner glow
        Adding multiple layers creates a more realistic light diffusion effect
      */}
      <div 
        className="absolute inset-0 blur-[10px] opacity-50 rounded-lg -z-10"
        style={{ 
          backgroundColor: `hsl(var(--${colorClass}))`,
          transform: 'scale(0.98)' 
        }}
        data-glow="inner"
      />
      
      {/* 
        Main content box - where the actual content is displayed
        We use relative z-10 to ensure it stays above the glow effects
        We apply the shadow-md for subtle depth and rounded-lg for consistent corners
      */}
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
