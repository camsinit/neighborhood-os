import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { User } from "lucide-react";
import { format } from "date-fns";

interface SafetyUpdateCardProps {
  update: {
    id: string;
    title: string;
    description: string;
    type: string;
    imageUrl?: string;
    created_at: string;
    profiles?: {
      display_name: string | null;
      avatar_url: string | null;
    };
  };
  onClick: () => void;
}

const SafetyUpdateCard = ({ update, onClick }: SafetyUpdateCardProps) => {
  return (
    <div 
      onClick={onClick}
      className="bg-white rounded-lg p-6 shadow-sm cursor-pointer hover:shadow-md transition-shadow"
    >
      <div className="flex items-center gap-3 mb-4">
        <Avatar className="h-8 w-8">
          <AvatarImage src={update.profiles?.avatar_url || ''} alt={update.profiles?.display_name || 'User'} />
          <AvatarFallback>
            <User className="h-4 w-4" />
          </AvatarFallback>
        </Avatar>
        <div>
          <p className="font-medium text-sm">{update.profiles?.display_name || 'Anonymous'}</p>
          <p className="text-xs text-gray-500">
            {update.created_at && format(new Date(update.created_at), 'MMM d, yyyy')}
          </p>
        </div>
      </div>
      
      {update.imageUrl && (
        <div className="mb-4">
          <img 
            src={update.imageUrl} 
            alt={update.title}
            className="w-full h-48 object-cover rounded-lg"
          />
        </div>
      )}
      
      <h3 className="text-lg font-semibold mb-2">{update.title}</h3>
      <p className="text-gray-600 text-sm line-clamp-2">{update.description}</p>
    </div>
  );
};

export default SafetyUpdateCard;
