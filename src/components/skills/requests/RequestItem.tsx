
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { SkillWithProfile } from "../types/skillTypes";

interface RequestItemProps {
  request: SkillWithProfile;
  onClick: (request: SkillWithProfile) => void;
}

const RequestItem = ({ request, onClick }: RequestItemProps) => (
  <div 
    key={request.id}
    className="p-3 border-b hover:bg-gray-50 cursor-pointer flex items-center gap-3"
    onClick={() => onClick(request)}
  >
    <Avatar className="h-9 w-9">
      <AvatarImage src={request.profiles?.avatar_url || undefined} />
      <AvatarFallback>{request.profiles?.display_name?.[0] || '?'}</AvatarFallback>
    </Avatar>
    
    <div className="flex-1 min-w-0">
      <p className="font-medium text-sm truncate">{request.title}</p>
      <p className="text-xs text-gray-500 truncate">
        From: {request.profiles?.display_name || 'Anonymous'}
      </p>
    </div>
  </div>
);

export default RequestItem;
