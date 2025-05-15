
import React from 'react';
import { cn } from "@/lib/utils";
import { ModuleHeaderProps, ModuleLayoutProps } from '@/types/module';
import { ModuleContainer, ModuleContent, ModuleHeader } from './module';

/**
 * ModuleLayout Component
 * 
 * This is the foundational layout component for all module pages.
 * It provides consistent structure and styling while avoiding duplicate headers.
 * 
 * @param children - The main content to be displayed in the module
 * @param title - The title of the module/page
 * @param description - Optional description text for the module/page
 * @param themeColor - The theme color identifier for the module
 * @param actions - Optional actions (buttons, etc.) to display in the header
 * @param className - Optional additional classes
 */
const ModuleLayout = ({
  children,
  title,
  description,
  themeColor,
  actions,
  className
}: ModuleLayoutProps) => {
  return (
    // Main container with theme-specific gradient background
    <ModuleContainer themeColor={themeColor}>
      <ModuleContent className={className}>
        {/* Header section with title, description, and optional actions */}
        <ModuleHeader 
          title={title} 
          description={description} 
          themeColor={themeColor} 
          actions={actions}
        />
        
        {/* Main content area */}
        <div className="bg-white/80 backdrop-blur-sm rounded-lg p-6 shadow-lg mt-6">
          {children}
        </div>
      </ModuleContent>
    </ModuleContainer>
  );
};

export default ModuleLayout;
