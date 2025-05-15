
import React from 'react';
import { cn } from "@/lib/utils";
import { ModuleContentProps } from '@/types/module';

/**
 * ModuleContent Component
 * 
 * This component provides consistent content area sizing and positioning
 * for all modules with proper scroll handling.
 * 
 * @param children - The content to be displayed
 * @param className - Optional additional classes
 */
const ModuleContent = ({
  children,
  className
}: ModuleContentProps) => {
  return (
    <div className="min-h-full w-full overflow-y-auto">
      {/* Content container with consistent padding */}
      <div className={cn("max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8", className)}>
        {children}
      </div>
    </div>
  );
};

export default ModuleContent;
