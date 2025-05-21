
import React from 'react';
import { ModuleHeaderProps } from '@/types/module';
import { cn } from '@/lib/utils';

/**
 * ModuleHeader Component
 * 
 * This component provides a standardized header section for all modules
 * with just the title. Description and actions are now handled separately
 * for consistency across all pages.
 * 
 * @param title - The title of the module
 * @param themeColor - The theme color identifier for styling
 */
const ModuleHeader = ({
  title,
  themeColor
}: Omit<ModuleHeaderProps, 'description' | 'actions'>) => {
  return (
    <div className="module-header mb-4">
      {/* Module title - Uses the theme color with darker shade and consistent padding */}
      <h2 className={cn(
        "text-2xl font-bold px-6 sm:px-6 lg:px-8 pt-[15px]",
        {
          "text-blue-900": themeColor === 'calendar',
          "text-green-800": themeColor === 'skills',
          "text-orange-800": themeColor === 'goods',
          "text-red-800": themeColor === 'safety',
          "text-purple-800": themeColor === 'neighbors',
        }
      )}>{title}</h2>
    </div>
  );
};

export default ModuleHeader;
