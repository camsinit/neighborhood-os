import { SupportItem } from "./types";
import SupportCard from "./SupportCard";

interface SupportSectionProps {
  title: string;
  items: SupportItem[];
}

const SupportSection = ({ title, items }: SupportSectionProps) => {
  // Determine border color based on section title
  const borderColorClass = title === "Needs" 
    ? "border-purple-500/50" 
    : "border-emerald-500/50";

  return (
    <div className={`rounded-lg border-2 ${borderColorClass} p-4`}>
      <h3 className="text-lg font-semibold mb-4">{title}</h3>
      <div className="space-y-4">
        {items.map((item, index) => (
          <SupportCard key={index} item={item} />
        ))}
      </div>
    </div>
  );
};

export default SupportSection;