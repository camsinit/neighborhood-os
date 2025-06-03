
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { SkillCategory } from './types/skillTypes';
import { Brain, Palette, Wrench, GraduationCap, Heart } from 'lucide-react';

/**
 * Individual category card that displays a skill category with preview of available skills
 * Now uses consistent white styling with title at bottom and icon next to title
 */

// Category configuration with consistent styling and icons
const categoryConfig: Record<SkillCategory, {
  icon: React.ElementType;
  displayName: string;
}> = {
  technology: {
    icon: Brain,
    displayName: 'Technology'
  },
  creative: {
    icon: Palette,
    displayName: 'Creative'
  },
  trade: {
    icon: Wrench,
    displayName: 'Trade & Repair'
  },
  education: {
    icon: GraduationCap,
    displayName: 'Education'
  },
  wellness: {
    icon: Heart,
    displayName: 'Wellness'
  }
};

interface SkillCategoryCardProps {
  category: SkillCategory;
  skillsData: { offers: string[], requests: string[] };
  onClick: (category: SkillCategory) => void;
}

const SkillCategoryCard: React.FC<SkillCategoryCardProps> = ({
  category,
  skillsData,
  onClick
}) => {
  const config = categoryConfig[category];
  const Icon = config.icon;
  
  // Combine offers and requests for preview, limit to 4 items
  const allSkills = [...skillsData.offers, ...skillsData.requests];
  const previewSkills = allSkills.slice(0, 4);
  const hasMoreSkills = allSkills.length > 4;
  const isEmpty = allSkills.length === 0;
  
  return (
    <Card 
      className="bg-white border border-gray-200 cursor-pointer hover:shadow-lg transition-shadow h-64 flex flex-col"
      onClick={() => onClick(category)}
    >
      {/* Main content area with skills preview at the top */}
      <CardContent className="flex-1 p-4 pb-0">
        {isEmpty ? (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <p className="text-gray-500 text-sm mb-2">
              No skills shared yet
            </p>
            <p className="text-gray-400 text-xs">
              Tap to add the first skill
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            <ul className="space-y-2">
              {previewSkills.map((skill, index) => (
                <li key={index} className="text-sm text-gray-700 flex items-start">
                  <span className="mr-2 text-gray-400">•</span>
                  <span className="line-clamp-1">{skill}</span>
                </li>
              ))}
            </ul>
            {hasMoreSkills && (
              <p className="text-xs text-gray-400 mt-3">
                and {allSkills.length - 4} more...
              </p>
            )}
          </div>
        )}
      </CardContent>
      
      {/* Title section at bottom with icon next to title */}
      <CardHeader className="bg-white border-t border-gray-100 p-4 mt-auto rounded-b-lg">
        <CardTitle className="text-lg font-semibold text-gray-800 text-center flex items-center justify-center gap-2">
          <Icon className="h-5 w-5 text-gray-600" />
          {config.displayName}
        </CardTitle>
      </CardHeader>
    </Card>
  );
};

export default SkillCategoryCard;
