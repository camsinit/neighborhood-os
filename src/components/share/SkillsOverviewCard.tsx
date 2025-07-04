import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { User, Clock, Calendar, MapPin, Star } from 'lucide-react';
import { format, parseISO } from 'date-fns';

/**
 * Interface for skills overview card props
 */
interface SkillsOverviewCardProps {
  data: any; // Skills data with profile information
  neighborhoodData: any; // Neighborhood context data
  onActionClick: () => void; // Action button handler
  actionButtonText: string; // Text for the action button
}

/**
 * SkillsOverviewCard - Public overview of a shared skill
 * 
 * This component displays skill information in a public context
 * without requiring authentication. It shows:
 * - Provider profile image and name
 * - Skill title, category, and description
 * - Availability and time preferences
 * - Neighborhood context
 * - Action button (join or view in dashboard)
 */
const SkillsOverviewCard: React.FC<SkillsOverviewCardProps> = ({
  data: skill,
  neighborhoodData,
  onActionClick,
  actionButtonText
}) => {
  // Helper function to get category colors
  const getCategoryStyle = (category: string) => {
    const styles = {
      technology: { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200' },
      emergency: { bg: 'bg-red-50', text: 'text-red-700', border: 'border-red-200' },
      professional: { bg: 'bg-purple-50', text: 'text-purple-700', border: 'border-purple-200' },
      maintenance: { bg: 'bg-orange-50', text: 'text-orange-700', border: 'border-orange-200' },
      care: { bg: 'bg-pink-50', text: 'text-pink-700', border: 'border-pink-200' },
      education: { bg: 'bg-green-50', text: 'text-green-700', border: 'border-green-200' }
    };
    return styles[category as keyof typeof styles] || styles.technology;
  };

  const categoryStyle = getCategoryStyle(skill.skill_category);

  // Format dates
  const createdDate = parseISO(skill.created_at);
  const validUntilDate = parseISO(skill.valid_until);
  const formattedCreated = format(createdDate, 'MMMM d, yyyy');
  const formattedValidUntil = format(validUntilDate, 'MMMM d, yyyy');

  // Capitalize first letter for display
  const capitalizeFirst = (str: string) => {
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
  };

  return (
    <Card className="w-full max-w-2xl mx-auto shadow-lg">
      <CardHeader className="pb-4">
        {/* Provider profile section */}
        <div className="flex items-center gap-3 mb-4">
          <Avatar className="h-12 w-12">
            <AvatarImage 
              src={skill.profiles?.avatar_url} 
              alt={skill.profiles?.display_name || 'Skill Provider'} 
            />
            <AvatarFallback>
              <User className="h-6 w-6" />
            </AvatarFallback>
          </Avatar>
          <div>
            <p className="text-sm text-gray-600">
              {skill.request_type === 'offer' ? 'Skill offered by' : 'Skill requested by'}
            </p>
            <p className="font-medium text-gray-900">
              {skill.profiles?.display_name || 'A neighbor'}
            </p>
          </div>
        </div>

        {/* Skill title */}
        <CardTitle className="text-2xl font-bold text-gray-900">
          {skill.title}
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Skill details */}
        <div className="space-y-3">
          {/* Category and type */}
          <div className="flex items-start gap-3">
            <Star className="h-5 w-5 text-gray-500 mt-0.5" />
            <div>
              <p className="font-medium text-gray-900">Category</p>
              <div className="flex items-center gap-2 mt-1">
                <Badge className={`${categoryStyle.bg} ${categoryStyle.text} border-0`}>
                  {capitalizeFirst(skill.skill_category)}
                </Badge>
                <Badge variant="outline">
                  {skill.request_type === 'offer' ? 'Offering' : 'Looking for'}
                </Badge>
              </div>
            </div>
          </div>

          {/* Availability */}
          {skill.availability && (
            <div className="flex items-start gap-3">
              <Clock className="h-5 w-5 text-gray-500 mt-0.5" />
              <div>
                <p className="font-medium text-gray-900">Availability</p>
                <p className="text-sm text-gray-600">{capitalizeFirst(skill.availability)}</p>
              </div>
            </div>
          )}

          {/* Time preferences */}
          {skill.time_preferences && skill.time_preferences.length > 0 && (
            <div className="flex items-start gap-3">
              <Calendar className="h-5 w-5 text-gray-500 mt-0.5" />
              <div>
                <p className="font-medium text-gray-900">Preferred times</p>
                <div className="flex flex-wrap gap-1 mt-1">
                  {skill.time_preferences.map((pref: string, index: number) => (
                    <Badge key={index} variant="secondary" className="text-xs">
                      {capitalizeFirst(pref)}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Location context */}
          <div className="flex items-start gap-3">
            <MapPin className="h-5 w-5 text-gray-500 mt-0.5" />
            <div>
              <p className="font-medium text-gray-900">Area</p>
              <p className="text-sm text-gray-600">
                {neighborhoodData?.name || 'Neighborhood'} community
                {neighborhoodData?.city && neighborhoodData?.state && (
                  <span> • {neighborhoodData.city}, {neighborhoodData.state}</span>
                )}
              </p>
            </div>
          </div>
        </div>

        {/* Skill description */}
        {skill.description && (
          <div>
            <h4 className="font-medium text-gray-900 mb-2">Description</h4>
            <p className="text-gray-600 leading-relaxed">{skill.description}</p>
          </div>
        )}

        {/* Additional info */}
        <div className="text-sm text-gray-500 space-y-1">
          <p>Posted: {formattedCreated}</p>
          <p>Available until: {formattedValidUntil}</p>
        </div>

        {/* Skill badges */}
        <div className="flex flex-wrap gap-2">
          <Badge variant="secondary" className="flex items-center gap-1">
            <Star className="h-3 w-3" />
            Skill
          </Badge>
          {neighborhoodData && (
            <Badge variant="outline">
              {neighborhoodData.name}
            </Badge>
          )}
        </div>

        {/* Action button */}
        <div className="pt-4 border-t">
          <Button 
            onClick={onActionClick}
            className="w-full"
            size="lg"
          >
            {actionButtonText}
          </Button>
        </div>

        {/* Footer information */}
        <div className="text-center text-sm text-gray-500">
          <p>This skill was shared from the {neighborhoodData?.name || 'neighborhood'} community</p>
        </div>
      </CardContent>
    </Card>
  );
};

export default SkillsOverviewCard;