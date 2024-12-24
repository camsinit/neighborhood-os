import { Button } from "@/components/ui/button";
import { SupportItem } from "./types";
import EditSupportRequestDialog from "../support/EditSupportRequestDialog";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { User } from "lucide-react";

const SupportCard = ({ item }: { item: SupportItem }) => {
  return (
    <div className={`group bg-white border-l-4 ${item.borderColor} rounded-lg p-3 pt-2 pb-6 shadow-sm hover:scale-[1.02] transition-all duration-200 ease-in-out relative`}>
      <div className="absolute top-3 right-3">
        <Avatar className="h-8 w-8">
          <AvatarImage 
            src={item.originalRequest.profiles?.avatar_url || ''} 
            alt={item.originalRequest.profiles?.display_name || 'User'} 
          />
          <AvatarFallback>
            <User className="h-4 w-4" />
          </AvatarFallback>
        </Avatar>
      </div>
      <div className="space-y-2">
        <div className={`inline-flex items-center px-2 py-0.5 rounded-full ${item.tagColor} ${item.tagBg} text-xs font-medium`}>
          {item.requestType}
        </div>
        <h4 className="text-lg font-medium">{item.title}</h4>
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
      <div className="transition-all duration-200 ease-in-out transform group-hover:translate-y-0 group-hover:opacity-100 group-hover:max-h-[500px] opacity-70 max-h-12 overflow-hidden">
        <p className="text-sm text-muted-foreground group-hover:mb-6 mb-0 line-clamp-2 group-hover:line-clamp-none cursor-pointer transition-all mt-3">
          {item.description}
        </p>
        <div className="flex items-center justify-between opacity-0 group-hover:opacity-100 transition-opacity duration-200 h-0 group-hover:h-auto">
          <span className="text-sm text-muted-foreground">{item.timeAgo}</span>
          <div className="flex items-center gap-2">
            <EditSupportRequestDialog request={item.originalRequest} />
            <Button variant="secondary">
              {item.type === "Needs Help" ? "I can help" : "I'm Interested"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SupportCard;