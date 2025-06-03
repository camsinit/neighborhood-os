
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { SkillCategory } from './types/skillTypes';
import { Brain, Palette, Wrench, GraduationCap, Heart } from 'lucide-react';

/**
 * Individual category card that displays a skill category with preview of available skills
 * Each category has a unique green shade and shows bullet points of actual skills
 */

// Category configuration with unique green shades and icons
const categoryConfig: Record<SkillCategory, {
  icon: React.ElementType;
  bgColor: string;
  borderColor: string;
  iconColor: string;
  displayName: string;
}> = {
  technology: {
    icon: Brain,
    bgColor: 'bg-emerald-50',
    borderColor: 'border-emerald-200',
    iconColor: 'text-emerald-600',
    displayName: 'Technology'
  },
  creative: {
    icon: Palette,
    bgColor: 'bg-green-50',
    borderColor: 'border-green-200',
    iconColor: 'text-green-600',
    displayName: 'Creative'
  },
  trade: {
    icon: Wrench,
    bgColor: 'bg-lime-50',
    borderColor: 'border-lime-200',
    iconColor: 'text-lime-600',
    displayName: 'Trade & Repair'
  },
  education: {
    icon: GraduationCap,
    bgColor: 'bg-teal-50',
    borderColor: 'border-teal-200',
    iconColor: 'text-teal-600',
    displayName: 'Education'
  },
  wellness: {
    icon: Heart,
    bgColor: 'bg-cyan-50',
    borderColor: 'border-cyan-200',
    iconColor: 'text-cyan-600',
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
  
  return (
    <Card 
      className={`${config.bgColor} ${config.borderColor} border-2 cursor-pointer hover:shadow-md transition-shadow`}
      onClick={() => onClick(category)}
    >
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Icon className={`h-5 w-5 ${config.iconColor}`} />
          <span className="text-gray-800">{config.displayName}</span>
        </CardTitle>
      </CardHeader>
      
      <CardContent>
        {allSkills.length === 0 ? (
          <p className="text-gray-500 text-sm italic">No skills available yet</p>
        ) : (
          <div className="space-y-1">
            <ul className="space-y-1">
              {previewSkills.map((skill, index) => (
                <li key={index} className="text-sm text-gray-700 flex items-start">
                  <span className="mr-2">•</span>
                  <span className="line-clamp-1">{skill}</span>
                </li>
              ))}
            </ul>
            {hasMoreSkills && (
              <p className="text-xs text-gray-500 mt-2">
                and {allSkills.length - 4} more...
              </p>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default SkillCategoryCard;
