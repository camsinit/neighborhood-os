
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ArrowUpRight } from 'lucide-react';
import { Skill } from '../types/skillTypes';

interface SkillCardProps {
  skill: Skill & { 
    profiles: { 
      avatar_url: string | null; 
      display_name: string | null; 
    } 
  };
  onContribute?: () => void;
  onRequest?: () => void;
  type: 'request' | 'offer';
}

const SkillCard = ({ skill, onContribute, onRequest, type }: SkillCardProps) => {
  if (type === 'request') {
    return (
      <div 
        className="relative flex-shrink-0 w-[250px] h-[150px] border border-dashed border-gray-300 rounded-lg p-4 bg-white cursor-pointer hover:border-gray-400 transition-colors"
      >
        <ArrowUpRight className="absolute top-2 right-2 h-4 w-4 text-gray-400" />
        <div className="h-full flex flex-col justify-between">
          <div className="flex items-center gap-3 mb-2">
            <Avatar className="h-8 w-8">
              <AvatarImage src={skill.profiles?.avatar_url || undefined} />
              <AvatarFallback>{skill.profiles?.display_name?.[0] || '?'}</AvatarFallback>
            </Avatar>
            <h4 className="font-medium text-gray-900 line-clamp-2">{skill.title}</h4>
          </div>
          <Button 
            variant="outline" 
            className="w-full"
            onClick={(e) => {
              e.stopPropagation();
              onContribute?.();
            }}
          >
            Contribute Skill
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-between p-4 rounded-lg border border-gray-200 hover:border-gray-300 bg-white">
      <div className="flex items-center gap-4">
        <Avatar className="h-12 w-12">
          <AvatarImage src={skill.profiles?.avatar_url || undefined} />
          <AvatarFallback>{skill.profiles?.display_name?.[0] || '?'}</AvatarFallback>
        </Avatar>
        <div>
          <h4 className="font-medium text-gray-900">{skill.title}</h4>
          <p className="text-sm text-gray-600 mt-1 line-clamp-2">{skill.description}</p>
        </div>
      </div>
      <Button variant="outline" onClick={onRequest}>Request Skill</Button>
    </div>
  );
};

export default SkillCard;
