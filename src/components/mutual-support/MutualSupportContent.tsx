
import { SupportItem, ViewType } from "./types";
import LoadingSkeleton from "./LoadingSkeleton";
import SupportSection from "./SupportSection";
import SkillListItem from "./SkillListItem";
import { Button } from "@/components/ui/button";
import { HeartHandshake } from "lucide-react";

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

  // Special handling for list views (skills and care only)
  if (useListView || ['skills', 'care'].includes(selectedView || '')) {
    const allItems = [...needs, ...offers];
    
    // Filter items based on selected category
    const displayItems = selectedView 
      ? allItems.filter(item => item.category === selectedView)
      : allItems;
    
    if (selectedView === 'care' && displayItems.length === 0) {
      return (
        <div className="max-w-4xl mx-auto mt-8 px-4">
          <Button 
            variant="outline" 
            onClick={() => onAddRequest("need")}
            className="w-full p-8 h-auto border-2 border-dashed border-gray-300 hover:border-gray-400 flex flex-col items-center gap-4"
          >
            <HeartHandshake className="h-8 w-8 text-gray-400" />
            <div className="flex flex-col items-center text-center">
              <p className="text-lg font-medium text-gray-900">No active care requests</p>
              <p className="text-sm text-gray-500 mt-1">Click here to submit a care request</p>
            </div>
          </Button>
        </div>
      );
    }
    
    return (
      <div className="space-y-1 max-w-4xl mx-auto bg-white rounded-lg shadow-sm">
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
