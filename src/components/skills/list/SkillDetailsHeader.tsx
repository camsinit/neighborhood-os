
/**
 * Header component for skill details display
 */
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { formatDistanceToNow } from 'date-fns';

/**
 * Props for the skill details header
 */
interface SkillDetailsHeaderProps {
  title: string;
  category: string;
  created_at: string;
}

/**
 * Component for displaying the header section of skill details
 * Includes title, category badge, and creation timestamp
 */
const SkillDetailsHeader: React.FC<SkillDetailsHeaderProps> = ({
  title,
  category,
  created_at
}) => {
  // Define category colors for visual distinction
  const categoryColors: Record<string, { bg: string; text: string }> = {
    technology: { bg: 'bg-blue-100', text: 'text-blue-800' },
    creativity: { bg: 'bg-purple-100', text: 'text-purple-800' },
    education: { bg: 'bg-green-100', text: 'text-green-800' },
    cooking: { bg: 'bg-orange-100', text: 'text-orange-800' },
    health: { bg: 'bg-red-100', text: 'text-red-800' },
    gardening: { bg: 'bg-emerald-100', text: 'text-emerald-800' },
    repair: { bg: 'bg-amber-100', text: 'text-amber-800' },
    other: { bg: 'bg-gray-100', text: 'text-gray-800' },
    creative: { bg: 'bg-purple-100', text: 'text-purple-800' },
    trade: { bg: 'bg-amber-100', text: 'text-amber-800' },
    wellness: { bg: 'bg-red-100', text: 'text-red-800' },
  };

  // Get the appropriate color scheme for the category
  const { bg, text } = categoryColors[category as keyof typeof categoryColors] || 
    categoryColors.other;

  // Format the creation date
  const formattedDate = created_at
    ? formatDistanceToNow(new Date(created_at), { addSuffix: true })
    : '';

  return (
    <div className="flex items-start justify-between">
      <div className="space-y-1">
        <h2 className="text-xl font-semibold text-gray-900">{title}</h2>
        <div className="flex gap-2 items-center">
          <Badge variant="outline" className={`${bg} ${text} border-none`}>
            {category}
          </Badge>
          <span className="text-xs text-gray-400">{formattedDate}</span>
        </div>
      </div>
    </div>
  );
};

export default SkillDetailsHeader;
