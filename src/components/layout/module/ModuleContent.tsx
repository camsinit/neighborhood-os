
import React from 'react';
import { cn } from "@/lib/utils";
import { ModuleContentProps } from '@/types/module';

/**
 * ModuleContent Component
 * 
 * This component provides consistent content area sizing and positioning
 * for all modules without additional header elements.
 * 
 * @param children - The content to be displayed
 * @param className - Optional additional classes
 */
const ModuleContent = ({
  children,
  className
}: ModuleContentProps) => {
  return (
    <div className="min-h-full w-full">
      {/* Content container with consistent padding */}
      <div className={cn("px-6 sm:px-6 lg:px-8 pb-10 max-w-7xl mx-auto", className)}>
        {children}
      </div>
    </div>
  );
};

export default ModuleContent;
