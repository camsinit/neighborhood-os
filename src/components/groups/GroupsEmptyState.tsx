import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Plus, Users, MapPin, Heart, Shield, Book, Utensils, Baby } from 'lucide-react';

interface GroupsEmptyStateProps {
  onCreateGroup: (templateData?: { name: string; description: string }) => void;
}

export const GroupsEmptyState: React.FC<GroupsEmptyStateProps> = ({ onCreateGroup }) => {
  // Popular group templates to suggest
  const groupTemplates = [
    { icon: Book, name: 'Book Club', description: 'Share and discuss your favorite reads' },
    { icon: Shield, name: 'Safety Watch', description: 'Keep your neighborhood safe together' },
    { icon: Utensils, name: 'Cooking Circle', description: 'Share recipes and cooking tips' },
    { icon: Baby, name: 'Parent Connect', description: 'Support for parents and families' },
    { icon: Heart, name: 'Garden Club', description: 'Green thumbs unite for beautiful spaces' },
    { icon: Users, name: 'Social Club', description: 'General socializing and fun activities' },
  ];

  return (
    <div className="py-12 px-4">
      {/* Popular group suggestions */}
      <div className="max-w-4xl mx-auto">
        {/* Enhanced heading with larger, bolder text for seniors */}
        <h4 className="text-2xl font-bold text-gray-900 mb-4 text-center">
          Popular Group Ideas
        </h4>
        {/* Moved instruction text to be under the heading */}
        <p className="text-base text-gray-700 font-medium text-center mb-8">
          Click any suggestion to get started, or create a custom group
        </p>
        {/* Reduced grid density and increased spacing for better readability */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-2xl mx-auto">
          {groupTemplates.map((template, index) => (
            <Button
              key={index}
              variant="outline"
              className="h-auto px-[15px] py-6 flex flex-col items-center gap-3 hover:bg-gray-50 border-2 border-purple-300 hover:border-purple-400 rounded-xl transition-all duration-200 min-h-[120px]"
              onClick={() => onCreateGroup({ name: template.name, description: template.description })}
            >
              {/* Icon and name on the same line */}
              <div className="flex items-center gap-3">
                <template.icon className="h-12 w-12 text-gray-700" />
                <span className="font-bold text-lg text-gray-900">{template.name}</span>
              </div>
              {/* Description below */}
              <span className="text-base text-gray-700 text-center leading-relaxed font-medium">
                {template.description}
              </span>
            </Button>
          ))}
        </div>
      </div>
    </div>
  );
};