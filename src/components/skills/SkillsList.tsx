
import MutualSupportContent from "@/components/mutual-support/MutualSupportContent";
import { SkillCategory } from "@/components/mutual-support/types";

interface SkillsListProps {
  isLoading: boolean;
  needs: any[];
  offers: any[];
  onItemClick: (item: any) => void;
  onAddRequest: (type: "need" | "offer") => void;
  selectedCategory: SkillCategory | null;
}

// Component to display the list of skills
const SkillsList = ({ 
  isLoading, 
  needs, 
  offers, 
  onItemClick, 
  onAddRequest,
  selectedCategory 
}: SkillsListProps) => {
  // Show pending requests section only if we're viewing a specific category
  const pendingRequests = selectedCategory ? needs : [];

  return (
    <>
      <MutualSupportContent 
        isLoading={isLoading}
        needs={needs}
        offers={offers}
        onItemClick={item => onItemClick(item.originalRequest)}
        onAddRequest={onAddRequest}
        selectedView="skills"
      />
      
      {pendingRequests.length > 0 && (
        <div className="px-8 py-6 mt-8 border-t">
          <h3 className="text-lg font-semibold mb-4">Open Skill Requests</h3>
          <div className="space-y-4">
            {pendingRequests.map(request => (
              <div 
                key={request.originalRequest.id} 
                className="p-4 rounded-lg border border-gray-200 hover:border-gray-300 cursor-pointer" 
                onClick={() => onItemClick(request.originalRequest)}
              >
                <h4 className="font-medium text-gray-900">{request.title}</h4>
                <p className="text-sm text-gray-600 mt-1">{request.description}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </>
  );
};

export default SkillsList;
