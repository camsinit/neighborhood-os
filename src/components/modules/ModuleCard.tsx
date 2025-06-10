
import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

/**
 * ModuleCard Component
 * 
 * Displays an individual module in the module hub with:
 * - Icon and color theming
 * - Name, tagline, and description
 * - Status badge
 * - Preview action button
 */

interface Module {
  id: string;
  name: string;
  tagline: string;
  description: string;
  icon: LucideIcon;
  accentColor: string;
  status: string;
}

interface ModuleCardProps {
  module: Module;
}

const ModuleCard: React.FC<ModuleCardProps> = ({ module }) => {
  const { name, tagline, description, icon: Icon, accentColor, status } = module;

  // Color mapping for accent colors
  const accentColors = {
    red: 'text-red-600 bg-red-50 border-red-200',
    blue: 'text-blue-600 bg-blue-50 border-blue-200',
    green: 'text-green-600 bg-green-50 border-green-200',
    orange: 'text-orange-600 bg-orange-50 border-orange-200',
    purple: 'text-purple-600 bg-purple-50 border-purple-200',
    teal: 'text-teal-600 bg-teal-50 border-teal-200'
  };

  // Get the appropriate color classes
  const colorClasses = accentColors[accentColor as keyof typeof accentColors] || accentColors.blue;

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-lg transition-all duration-200 hover:border-gray-300">
      {/* Header with icon and status */}
      <div className="flex items-start justify-between mb-4">
        <div className={cn(
          "p-3 rounded-lg border-2",
          colorClasses
        )}>
          <Icon className="h-6 w-6" />
        </div>
        
        {status === 'coming-soon' && (
          <Badge variant="secondary" className="text-xs">
            Coming Soon
          </Badge>
        )}
      </div>

      {/* Module info */}
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-gray-900 mb-1">
          {name}
        </h3>
        <p className="text-sm font-medium text-gray-600 mb-3">
          {tagline}
        </p>
        <p className="text-sm text-gray-600 leading-relaxed">
          {description}
        </p>
      </div>

      {/* Action button */}
      <div className="pt-2">
        <Button 
          variant="outline" 
          size="sm" 
          className="w-full"
          disabled={status === 'coming-soon'}
        >
          {status === 'coming-soon' ? 'Preview Soon' : 'Add Module'}
        </Button>
      </div>
    </div>
  );
};

export default ModuleCard;
