
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
 * It provides consistent structure and styling while ensuring proper left-alignment
 * for all key elements (title, description, and content).
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
      {/* Header section with proper left-alignment */}
      <div className="max-w-7xl mx-auto px-6 lg:px-8 pt-8 pb-6">
        {/* Title - left-aligned */}
        <h1 className="text-3xl font-bold text-white mb-4 text-left">{title}</h1>
        
        {/* Description box - left-aligned and full-width within container */}
        {description && (
          <div className="bg-white/80 backdrop-blur-sm rounded-lg p-4 border border-gray-100 shadow-sm">
            <p className="text-gray-700 text-sm text-left">{description}</p>
          </div>
        )}
      </div>
      
      <ModuleContent className={className}>
        {/* Main content area - left-aligned container */}
        <div className="bg-white/80 backdrop-blur-sm rounded-lg p-6 shadow-lg">
          {children}
        </div>
      </ModuleContent>
    </ModuleContainer>
  );
};

export default ModuleLayout;
