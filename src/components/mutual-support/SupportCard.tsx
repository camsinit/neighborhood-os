
import { Button } from "@/components/ui/button";
import { SupportItem } from "./types";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { User } from "lucide-react";
import { format } from "date-fns";

const SupportCard = ({ item, onClick }: { item: SupportItem; onClick: () => void }) => {
  const isTimeSensitive = ["goods", "transportation"].includes(item.requestType.toLowerCase());
  
  return (
    <div 
      className={`group bg-white border border-gray-200 ${item.borderColor} rounded-lg p-3 pt-2 pb-6 shadow-sm hover:scale-[1.02] transition-all duration-200 ease-in-out relative cursor-pointer`}
      onClick={onClick}
    >
      <div className="flex items-center justify-between mb-4">
        <h4 className="text-lg font-medium">{item.title}</h4>
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground">{item.timeAgo}</span>
          <Avatar className="h-6 w-6">
            <AvatarImage 
              src={item.originalRequest.profiles?.avatar_url || ''} 
              alt={item.originalRequest.profiles?.display_name || 'User'} 
            />
            <AvatarFallback>
              <User className="h-3 w-3" />
            </AvatarFallback>
          </Avatar>
        </div>
      </div>
      {item.imageUrl && item.requestType === 'goods' && (
        <div className="mt-4">
          <img 
            src={item.imageUrl} 
            alt={item.title}
            className="w-full h-48 object-cover rounded-md"
          />
        </div>
      )}
      <p className="text-sm text-muted-foreground mt-3 line-clamp-2">
        {item.description}
      </p>
      {isTimeSensitive && item.originalRequest.valid_until && (
        <div className="mt-2">
          <span className="text-xs text-muted-foreground">
            Due: {format(new Date(item.originalRequest.valid_until), 'MMM d, yyyy')}
          </span>
        </div>
      )}
    </div>
  );
};

export default SupportCard;
