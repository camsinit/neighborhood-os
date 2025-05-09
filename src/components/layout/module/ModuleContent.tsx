
import React from 'react';
import { cn } from "@/lib/utils";
import { ModuleContentProps } from '@/types/module';

/**
 * ModuleContent Component
 * 
 * This component provides consistent content area sizing and positioning
 * for all modules.
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
      {/* This div will have the gradient applied based on theme color in ModuleContainer */}
      <div className={cn("max-w-7xl mx-auto px-4 sm:px-6 lg:px-8", className)}>
        <div className="py-8">
          {children}
        </div>
      </div>
    </div>
  );
};

export default ModuleContent;
