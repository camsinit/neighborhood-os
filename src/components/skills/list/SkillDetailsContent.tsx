
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useUser } from '@supabase/auth-helpers-react';
import { formatDistanceToNow } from 'date-fns';
import SkillSessionRequestDialog from '@/components/skills/SkillSessionRequestDialog';

interface SkillDetailsContentProps {
  id: string;
  title: string;
  description?: string | null;
  category: string;
  profiles?: {
    display_name: string | null;
    avatar_url: string | null;
    id: string;
  }[];
  created_at: string;
  request_type: string;
  availability?: string | null;
  time_preferences?: string[] | null;
  onClose?: () => void;
}

const SkillDetailsContent: React.FC<SkillDetailsContentProps> = ({
  id,
  title,
  description,
  category,
  profiles = [],
  created_at,
  request_type,
  availability,
  time_preferences,
  onClose,
}) => {
  const [showRequestDialog, setShowRequestDialog] = useState(false);
  const user = useUser();

  const profile = profiles[0] || {};
  const isOwnSkill = user?.id === profile.id;
  const isRequest = request_type === 'need';

  const formattedDate = created_at
    ? formatDistanceToNow(new Date(created_at), { addSuffix: true })
    : '';

  const categoryColors: Record<string, { bg: string; text: string }> = {
    technology: { bg: 'bg-blue-100', text: 'text-blue-800' },
    creativity: { bg: 'bg-purple-100', text: 'text-purple-800' },
    education: { bg: 'bg-green-100', text: 'text-green-800' },
    cooking: { bg: 'bg-orange-100', text: 'text-orange-800' },
    health: { bg: 'bg-red-100', text: 'text-red-800' },
    gardening: { bg: 'bg-emerald-100', text: 'text-emerald-800' },
    repair: { bg: 'bg-amber-100', text: 'text-amber-800' },
    other: { bg: 'bg-gray-100', text: 'text-gray-800' },
  };

  const { bg, text } = categoryColors[category as keyof typeof categoryColors] || 
    categoryColors.other;

  return (
    <div className="space-y-6 p-1">
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

      <div className="flex items-center gap-3">
        <Avatar className="h-10 w-10">
          {profile.avatar_url ? (
            <AvatarImage src={profile.avatar_url} alt={profile.display_name || ''} />
          ) : (
            <AvatarFallback>{(profile.display_name || 'U')[0]}</AvatarFallback>
          )}
        </Avatar>
        <div>
          <p className="font-medium text-gray-900">{profile.display_name || 'Neighbor'}</p>
          <p className="text-sm text-gray-500">
            {isRequest ? 'Needs help with this' : 'Offering to help'}
          </p>
        </div>
      </div>

      {description && (
        <div className="space-y-2">
          <h3 className="text-sm font-medium text-gray-900">Description</h3>
          <p className="text-gray-600 text-sm whitespace-pre-wrap">{description}</p>
        </div>
      )}

      {availability && (
        <div className="space-y-2">
          <h3 className="text-sm font-medium text-gray-900">Availability</h3>
          <p className="text-gray-600 text-sm">{availability}</p>
        </div>
      )}

      {time_preferences && time_preferences.length > 0 && (
        <div className="space-y-2">
          <h3 className="text-sm font-medium text-gray-900">Time Preferences</h3>
          <div className="flex flex-wrap gap-2">
            {time_preferences.map((time, i) => (
              <Badge key={i} variant="outline" className="bg-gray-100 text-gray-800 border-none">
                {time}
              </Badge>
            ))}
          </div>
        </div>
      )}

      {!isOwnSkill && (
        <div className="pt-4">
          <Button 
            onClick={() => setShowRequestDialog(true)} 
            className="w-full"
          >
            {isRequest ? 'Offer to Help' : 'Request to Learn'}
          </Button>
        </div>
      )}

      <SkillSessionRequestDialog
        open={showRequestDialog}
        onOpenChange={setShowRequestDialog}
        skillId={id}
        skillTitle={title}
        providerId={profile.id}
      />
    </div>
  );
};

export default SkillDetailsContent;
