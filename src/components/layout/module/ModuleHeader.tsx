
import React from 'react';
import { ModuleHeaderProps } from '@/types/module';

/**
 * ModuleHeader Component
 * 
 * This component provides a standardized header section for all modules
 * with title, optional description, and optional action buttons.
 * 
 * @param title - The title of the module
 * @param description - Optional description text
 * @param themeColor - The theme color identifier for styling
 * @param actions - Optional actions (buttons, etc.) to display in the header
 */
const ModuleHeader = ({ title, description, themeColor, actions }: ModuleHeaderProps) => {
  return (
    <div className="flex flex-col">
      <div className="flex justify-between items-center">
        {/* Module title */}
        <h2 className="text-2xl font-bold text-gray-900">{title}</h2>
        
        {/* Optional action buttons */}
        {actions && (
          <div className="flex gap-2">
            {actions}
          </div>
        )}
      </div>
      
      {/* Optional description box */}
      {description && (
        <div className="mt-4 bg-white/80 backdrop-blur-sm rounded-lg p-4 border border-gray-100 shadow-sm">
          <p className="text-gray-700 text-sm">{description}</p>
        </div>
      )}
    </div>
  );
};

export default ModuleHeader;
