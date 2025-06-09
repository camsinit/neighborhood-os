
import React from 'react';
import { cn } from "@/lib/utils";
import ModuleHeader from './module/ModuleHeader';
import ModuleContent from './module/ModuleContent';
import ModuleContainer from './module/ModuleContainer';
import { ModuleLayoutProps } from '@/types/module';

/**
 * ModuleLayout Component
 * 
 * This is the foundational layout component for all module pages.
 * It provides consistent structure and styling while avoiding duplicate headers.
 * Updated to display description inline with the title instead of below it.
 * 
 * @param children - The main content to be displayed in the module
 * @param title - The title of the module/page
 * @param description - Optional description text for the module/page
 * @param themeColor - The theme color identifier for the module (e.g., 'calendar', 'skills')
 * @param className - Optional additional classes
 */
const ModuleLayout = ({
  children,
  title,
  description,
  themeColor,
  className
}: ModuleLayoutProps) => {
  return (
    // Main container with theme-specific gradient background
    <ModuleContainer themeColor={themeColor}>
      {/* Header with title and inline description */}
      <div className="max-w-7xl mx-auto px-6 lg:px-10 pt-8 pb-6 sm:px-[25px]">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <h1 className="text-3xl font-bold text-white">{title}</h1>
          {description && (
            <div className="module-description bg-white/80 backdrop-blur-sm rounded-lg p-4 border border-gray-100 shadow-sm max-w-md">
              <p className="text-gray-700 text-sm">{description}</p>
            </div>
          )}
        </div>
      </div>
      
      <ModuleContent className={className}>
        {/* Main content area */}
        <div className="bg-white/80 backdrop-blur-sm rounded-lg p-6 shadow-lg mt-6">
          {children}
        </div>
      </ModuleContent>
    </ModuleContainer>
  );
};

export default ModuleLayout;
