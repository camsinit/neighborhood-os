import { Button } from "@/components/ui/button";
import { SupportItem } from "./types";

const SupportCard = ({ type, title, description, timeAgo, borderColor, tagColor, tagBg, requestType }: SupportItem) => {
  return (
    <div className={`bg-white border-l-4 ${borderColor} rounded-lg p-6 shadow-sm relative`}>
      <div className={`inline-flex items-center px-3 py-1.5 rounded-full ${tagColor} ${tagBg} text-sm font-medium mb-3`}>
        {type}
      </div>
      <div className="absolute top-6 right-6 text-xs font-medium text-gray-500 bg-gray-100 px-2 py-1 rounded">
        {requestType}
      </div>
      <h4 className="text-lg font-medium mb-3">{title}</h4>
      <p className="text-muted-foreground mb-6 line-clamp-2 hover:line-clamp-none cursor-pointer transition-all">
        {description}
      </p>
      <div className="flex items-center justify-between">
        <span className="text-sm text-muted-foreground">{timeAgo}</span>
        <Button variant="secondary">
          {type === "Needs Help" ? "I can help" : "I'm Interested"}
        </Button>
      </div>
    </div>
  );
};

export default SupportCard;