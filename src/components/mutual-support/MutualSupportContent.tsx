
import { SupportItem, ViewType } from "./types";
import LoadingSkeleton from "./LoadingSkeleton";
import SupportSection from "./SupportSection";
import SkillListItem from "./SkillListItem";

interface MutualSupportContentProps {
  isLoading: boolean;
  needs: SupportItem[];
  offers: SupportItem[];
  onItemClick: (item: SupportItem) => void;
  onAddRequest: (type: "need" | "offer") => void;
  useListView?: boolean;
  selectedView: ViewType;
}

const MutualSupportContent = ({ 
  isLoading, 
  needs, 
  offers, 
  onItemClick,
  onAddRequest,
  useListView = false,
  selectedView
}: MutualSupportContentProps) => {
  if (isLoading) {
    return (
      <div className="grid md:grid-cols-2 gap-8">
        <LoadingSkeleton />
        <LoadingSkeleton />
      </div>
    );
  }

  // Special handling for list views (skills, care, goods)
  if (useListView || selectedView === 'skills' || selectedView === 'care' || selectedView === 'goods') {
    const allItems = [...needs, ...offers];
    
    // Filter items based on selected category
    const displayItems = selectedView 
      ? allItems.filter(item => item.category === selectedView)
      : allItems;
    
    return (
      <div className="space-y-1 max-w-4xl mx-auto bg-white rounded-lg shadow-md">
        {displayItems.map((item) => (
          <SkillListItem
            key={`${item.title}-${item.type}`}
            item={item}
            onClick={() => onItemClick(item)}
          />
        ))}
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
