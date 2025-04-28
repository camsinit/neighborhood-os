
import React from 'react';
import { cn } from "@/lib/utils";
import { ModuleContainerProps } from '@/types/module';

/**
 * ModuleContainer Component
 * 
 * This component provides the outermost container for a module with the appropriate
 * gradient background based on the theme color.
 * 
 * @param children - The content to be displayed in the container
 * @param themeColor - The theme color identifier for the module
 * @param className - Optional additional classes
 */
const ModuleContainer = ({ 
  children, 
  themeColor,
  className 
}: ModuleContainerProps) => {
  // CSS class for the gradient background based on theme
  const gradientClass = `page-gradient ${themeColor}-gradient`;
  
  return (
    <div className={cn(gradientClass, className)}>
      <div className="relative z-10 min-h-full w-full">
        {children}
      </div>
    </div>
  );
};

export default ModuleContainer;
