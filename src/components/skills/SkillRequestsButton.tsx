
import React from 'react';
import { Button } from '@/components/ui/button';
import { MessageSquarePlus } from 'lucide-react';

interface SkillRequestsButtonProps {
  isActive: boolean;
  onClick: () => void;
}

// Renamed to better reflect its new purpose
const SkillRequestsButton = ({ isActive, onClick }: SkillRequestsButtonProps) => {
  return (
    <Button 
      variant="outline" 
      size="default"
      className={`gap-2 ${isActive ? 'bg-[#F1F1F1]' : 'bg-white'}`}
      onClick={onClick}
    >
      <MessageSquarePlus className="h-4 w-4" />
      <span>Skill Requests</span>
    </Button>
  );
};

export default SkillRequestsButton;
