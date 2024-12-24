import { SupportItem } from "./types";
import LoadingSkeleton from "./LoadingSkeleton";
import SupportSection from "./SupportSection";

interface MutualSupportContentProps {
  isLoading: boolean;
  needs: SupportItem[];
  offers: SupportItem[];
  onItemClick: (item: SupportItem) => void;
  onAddRequest: (type: "need" | "offer") => void;
}

const MutualSupportContent = ({ 
  isLoading, 
  needs, 
  offers, 
  onItemClick,
  onAddRequest 
}: MutualSupportContentProps) => {
  if (isLoading) {
    return (
      <div className="grid md:grid-cols-2 gap-8">
        <LoadingSkeleton />
        <LoadingSkeleton />
      </div>
    );
  }

  return (
    <div className="grid md:grid-cols-2 gap-8">
      <SupportSection 
        title="Needs" 
        items={needs}
        onItemClick={onItemClick}
        onAddClick={() => onAddRequest("need")}
        buttonLabel="New Need"
      />
      <SupportSection 
        title="Offers" 
        items={offers}
        onItemClick={onItemClick}
        onAddClick={() => onAddRequest("offer")}
        buttonLabel="New Offer"
      />
    </div>
  );
};

export default MutualSupportContent;