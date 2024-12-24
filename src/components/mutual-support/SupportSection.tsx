import { SupportItem } from "./types";
import SupportCard from "./SupportCard";

interface SupportSectionProps {
  title: string;
  items: SupportItem[];
  onItemClick: (item: SupportItem) => void;
}

const SupportSection = ({ title, items, onItemClick }: SupportSectionProps) => {
  return (
    <div className="space-y-6">
      <h3 className="text-lg font-medium mb-4">{title}</h3>
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