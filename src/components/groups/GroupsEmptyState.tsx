import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Plus, Users, MapPin, Heart, Shield, Book, Utensils, Baby } from 'lucide-react';

interface GroupsEmptyStateProps {
  onCreateGroup: () => void;
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
        <h4 className="text-lg font-semibold text-gray-900 mb-4 text-center">
          Popular Group Ideas
        </h4>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {groupTemplates.map((template, index) => (
            <Button
              key={index}
              variant="outline"
              className="h-auto p-4 flex flex-col items-center gap-2 hover:bg-gray-50 border-gray-200"
              onClick={onCreateGroup}
            >
              <template.icon className="h-5 w-5 text-gray-600" />
              <span className="font-medium text-sm">{template.name}</span>
              <span className="text-xs text-gray-500 text-center leading-tight">
                {template.description}
              </span>
            </Button>
          ))}
        </div>
        
        <div className="text-center mt-6">
          <p className="text-sm text-gray-500">
            Click any suggestion to get started, or create a custom group
          </p>
        </div>
      </div>
    </div>
  );
};