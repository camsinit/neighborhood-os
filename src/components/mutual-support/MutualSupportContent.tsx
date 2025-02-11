
import { SupportItem } from "./types";
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
}

const MutualSupportContent = ({ 
  isLoading, 
  needs, 
  offers, 
  onItemClick,
  onAddRequest,
  useListView = false
}: MutualSupportContentProps) => {
  if (isLoading) {
    return (
      <div className="grid md:grid-cols-2 gap-8">
        <LoadingSkeleton />
        <LoadingSkeleton />
      </div>
    );
  }

  // Special handling for skills view
  if (useListView) {
    const allItems = [...needs, ...offers];
    const isSkillsView = allItems.some(item => item.requestType === 'skills');
    
    // Use SkillListItem for skills view
    if (isSkillsView) {
      return (
        <div className="space-y-1 max-w-4xl mx-auto bg-white rounded-lg border divide-y">
          {allItems.map((item) => (
            <SkillListItem
              key={`${item.title}-${item.type}`}
              item={item}
              onClick={() => onItemClick(item)}
            />
          ))}
        </div>
      );
    }

    // Default list view for other categories
    return (
      <div className="space-y-4">
        {allItems.map((item) => (
          <div 
            key={`${item.title}-${item.type}`}
            className="max-w-3xl mx-auto"
            onClick={() => onItemClick(item)}
          >
            <SupportSection
              items={[item]}
              title=""
              onItemClick={onItemClick}
              onAddClick={() => {}}
              buttonLabel=""
              hideHeader
            />
          </div>
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
