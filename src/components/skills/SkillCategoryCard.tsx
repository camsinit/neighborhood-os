import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { SkillCategory } from './types/skillTypes';
import { Brain, Shield, Briefcase, Wrench, Heart, GraduationCap, Plus } from 'lucide-react';

/**
 * Individual category card that displays a skill category with preview of available skills
 * Now uses the 6 standardized onboarding categories with consistent white styling
 * Reduced to 2/3 height and only shows skill offers (not requests) in preview
 * Left-aligned titles and icons with unique colors for each category
 */

// Category configuration with standardized onboarding categories, icons, and unique colors
const categoryConfig: Record<SkillCategory, {
  icon: React.ElementType;
  displayName: string;
  iconColor: string;
}> = {
  technology: {
    icon: Brain,
    displayName: 'Technology',
    iconColor: 'text-green-600'
  },
  emergency: {
    icon: Shield,
    displayName: 'Safety and Emergency',
    iconColor: 'text-green-600'
  },
  professional: {
    icon: Briefcase,
    displayName: 'Life Skills',
    iconColor: 'text-green-600'
  },
  care: {
    icon: Heart,
    displayName: 'Daily Support',
    iconColor: 'text-green-600'
  },
  education: {
    icon: GraduationCap,
    displayName: 'Learning and Fun',
    iconColor: 'text-green-600'
  },
  maintenance: {
    icon: Wrench,
    displayName: 'Maintenance',
    iconColor: 'text-green-600'
  }
};
interface SkillCategoryCardProps {
  category: SkillCategory;
  skillsData: {
    offers: string[];
    requests: string[];
  };
  onClick: (category: SkillCategory) => void;
}
const SkillCategoryCard: React.FC<SkillCategoryCardProps> = ({
  category,
  skillsData,
  onClick
}) => {
  const config = categoryConfig[category];
  const Icon = config.icon;

  // Only show offers in the preview, limit to 3 items for the reduced height
  const previewSkills = skillsData.offers.slice(0, 3);
  const hasMoreSkills = skillsData.offers.length > 3;
  const isEmpty = skillsData.offers.length === 0;
  return <Card className={`bg-white border cursor-pointer transition-all duration-200 h-44 flex flex-col ${isEmpty ? 'border-2 border-dashed border-gray-300 hover:border-green-400 hover:bg-green-50/30' : 'border-gray-200 hover:shadow-lg hover:border-gray-300'}`} onClick={() => onClick(category)}>
      {/* Main content area with skills preview at the top */}
      <CardContent className="flex-1 p-4 pb-0">
        {isEmpty ? <div className="flex flex-col items-center justify-center h-full text-center">
            <div className="mb-3 p-3 rounded-full bg-green-100">
              <Plus className="h-6 w-6 text-green-600" />
            </div>
            <p className="text-gray-700 text-sm font-medium mb-1">
              Add your first skill
            </p>
            
          </div> : <div className="space-y-2">
            <ul className="space-y-1.5">
              {previewSkills.map((skill, index) => <li key={index} className="text-sm text-gray-700 flex items-start">
                  <span className="mr-2 text-gray-400 mt-0.5">•</span>
                  <span className="line-clamp-1">{skill}</span>
                </li>)}
            </ul>
            {hasMoreSkills && <p className="text-xs text-gray-400 mt-2">
                and {skillsData.offers.length - 3} more...
              </p>}
          </div>}
      </CardContent>
      
      {/* Title section at bottom with icon next to title - left aligned */}
      <CardHeader className="bg-white border-t border-gray-100 p-3 mt-auto rounded-b-lg">
        <CardTitle className="text-base font-semibold text-gray-800 flex items-center gap-2">
          <Icon className={`h-4 w-4 ${config.iconColor}`} />
          {config.displayName}
        </CardTitle>
      </CardHeader>
    </Card>;
};
export default SkillCategoryCard;