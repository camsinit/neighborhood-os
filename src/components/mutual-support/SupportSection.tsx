
import { SupportItem } from "./types";
import SupportCard from "./SupportCard";
import { Button } from "@/components/ui/button";

interface SupportSectionProps {
  title: string;
  items: SupportItem[];
  onItemClick: (item: SupportItem) => void;
  onAddClick: () => void;
  buttonLabel: string;
  hideHeader?: boolean;
}

const SupportSection = ({ 
  title, 
  items, 
  onItemClick, 
  onAddClick, 
  buttonLabel,
  hideHeader = false
}: SupportSectionProps) => {
  return (
    <div className="space-y-6">
      {!hideHeader && (
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-medium">{title}</h3>
          <Button 
            onClick={onAddClick}
            className="h-[28px] bg-[#9b87f5] hover:bg-[#7E69AB] text-white"
            size="sm"
          >
            {buttonLabel}
          </Button>
        </div>
      )}
      {items.map((item) => (
        <SupportCard 
          key={item.title} 
          item={item} 
          onClick={() => onItemClick(item)}
        />
      ))}
    </div>
  );
};

export default SupportSection;
