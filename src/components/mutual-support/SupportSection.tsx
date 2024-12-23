import { SupportItem } from "./types";
import SupportCard from "./SupportCard";

interface SupportSectionProps {
  title: string;
  items: SupportItem[];
}

const SupportSection = ({ title, items }: SupportSectionProps) => {
  return (
    <div className="space-y-6">
      <h3 className="text-lg font-medium mb-4">{title}</h3>
      {items.map((item) => (
        <SupportCard key={item.title} item={item} />
      ))}
    </div>
  );
};

export default SupportSection;