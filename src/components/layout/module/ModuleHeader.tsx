
import React from 'react';
import { ModuleHeaderProps } from '@/types/module';
import { cn } from '@/lib/utils';

/**
 * ModuleHeader Component
 * 
 * This component provides a standardized header section for all modules
 * with title, optional description, and optional action buttons.
 * 
 * @param title - The title of the module
 * @param description - Optional description text
 * @param themeColor - The theme color identifier for styling
 * @param actions - Optional action buttons to display in the header
 */
const ModuleHeader = ({
  title,
  description,
  themeColor,
  actions
}: ModuleHeaderProps) => {
  return <div className="module-header mb-4">
      <div className="flex justify-between items-center px-1">
        {/* Module title - Now uses the theme color with darker shade and consistent padding */}
        <h2 className={cn(
          "text-2xl font-bold pt-[15px] px-6 sm:px-6 lg:px-8",
          {
            "text-blue-900": themeColor === 'calendar',
            "text-green-800": themeColor === 'skills',
            "text-orange-800": themeColor === 'goods',
            "text-red-800": themeColor === 'safety',
            "text-purple-800": themeColor === 'neighbors',
          }
        )}>{title}</h2>
        
        {/* Action buttons container */}
        {actions && <div className="flex items-center gap-2">
            {actions}
          </div>}
      </div>
      
      {/* Optional description box - Now has consistent margins */}
      {description && <div className="module-description mt-4 mb-6 bg-white/80 backdrop-blur-sm rounded-lg p-4 border border-gray-100 shadow-sm">
          <p className="text-gray-700 text-sm">{description}</p>
        </div>}
    </div>;
};
export default ModuleHeader;
