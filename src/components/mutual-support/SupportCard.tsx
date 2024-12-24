import { Button } from "@/components/ui/button";
import { SupportItem } from "./types";
import EditSupportRequestDialog from "../support/EditSupportRequestDialog";

const SupportCard = ({ item }: { item: SupportItem }) => {
  return (
    <div className={`bg-white border-l-4 ${item.borderColor} rounded-lg p-6 shadow-sm`}>
      <div className="flex items-center gap-4 mb-3">
        <div className={`inline-flex items-center px-3 py-1.5 rounded-full ${item.tagColor} ${item.tagBg} text-sm font-medium`}>
          {item.requestType}
        </div>
        <h4 className="text-lg font-medium">{item.title}</h4>
      </div>
      {item.imageUrl && item.requestType === 'goods' && (
        <div className="mb-4">
          <img 
            src={item.imageUrl} 
            alt={item.title}
            className="w-full h-48 object-cover rounded-md"
          />
        </div>
      )}
      <p className="text-sm text-muted-foreground mb-6 line-clamp-2 hover:line-clamp-none cursor-pointer transition-all">
        {item.description}
      </p>
      <div className="flex items-center justify-between">
        <span className="text-sm text-muted-foreground">{item.timeAgo}</span>
        <div className="flex items-center gap-2">
          <EditSupportRequestDialog request={item.originalRequest} />
          <Button variant="secondary">
            {item.type === "Needs Help" ? "I can help" : "I'm Interested"}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default SupportCard;