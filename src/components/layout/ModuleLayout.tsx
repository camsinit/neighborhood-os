
import React from 'react';
import { cn } from "@/lib/utils";
import ModuleHeader from './module/ModuleHeader';
import ModuleContent from './module/ModuleContent';
import ModuleContainer from './module/ModuleContainer';
import { ModuleLayoutProps } from '@/types/module';
import { Info } from 'lucide-react';
import { moduleThemeColors } from '@/theme/moduleTheme';

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
  // Get theme colors for this module
  const themeConfig = moduleThemeColors[themeColor];
  
  return (
    // Main container without gradient background
    <div className="min-h-screen bg-gray-50">
      {/* Header section with proper left-alignment */}
      <div className="max-w-7xl mx-auto px-6 lg:px-8 pt-8 pb-6">
        {/* Title - theme-colored and left-aligned */}
        <h1 
          className="text-3xl font-bold mb-4 text-left"
          style={{ color: themeConfig.primary }}
        >
          {title}
        </h1>
        
        {/* Description box with gradient and colored border */}
        {description && (
          <div 
            className="rounded-lg p-4 border-2 shadow-sm flex items-start gap-3"
            style={{ 
              background: `linear-gradient(to right, ${themeConfig.primary}20, ${themeConfig.primary}05)`,
              borderColor: themeConfig.primary
            }}
          >
            <Info 
              className="h-5 w-5 mt-0.5 shrink-0" 
              style={{ color: themeConfig.primary }}
            />
            <p className="text-sm text-left leading-relaxed text-black">
              {description}
            </p>
          </div>
        )}
      </div>
      
      <div className="max-w-7xl mx-auto px-6 lg:px-8 pb-8">
        {/* Content without automatic container - let children handle their own styling */}
        {children}
      </div>
    </div>
  );
};

export default ModuleLayout;
