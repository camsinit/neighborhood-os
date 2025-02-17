
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Plus, HelpCircle, List } from "lucide-react";

interface SkillsHeaderProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onAddRequest: (type: "need" | "offer") => void;
  onViewRequests: () => void;
  isViewingRequests?: boolean;
}

// Component for the search bar and action buttons at the top of the skills page
const SkillsHeader = ({ 
  searchQuery, 
  onSearchChange, 
  onAddRequest,
  onViewRequests,
  isViewingRequests = false
}: SkillsHeaderProps) => {
  // Header description text that changes based on the view
  const getHeaderDescription = () => {
    if (isViewingRequests) {
      return "Browse and respond to current skill requests from your neighbors. Connect with those seeking to learn and share your expertise.";
    }
    return "Welcome to your community hub. Here you can quickly access common actions to connect, share, and engage with your neighbors.";
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between py-4 flex-nowrap">
        {/* Search input with icon */}
        <div className="relative w-[200px] flex-shrink-0">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 h-4 w-4" />
          <Input 
            type="search" 
            placeholder="Search for skills..." 
            className="pl-10" 
            value={searchQuery} 
            onChange={e => onSearchChange(e.target.value)} 
          />
        </div>
        
        {/* Action buttons */}
        <div className="flex items-center gap-3 flex-shrink-0">
          {/* Offer Skill button */}
          <Button 
            variant="outline"
            onClick={() => onAddRequest("offer")} 
            className="bg-[#0EA5E9] hover:bg-[#0EA5E9]/90 text-white whitespace-nowrap border-0"
          >
            <Plus className="h-4 w-4 mr-2" />
            Offer Skill
          </Button>

          {/* Request Skill button */}
          <Button 
            variant="outline" 
            onClick={() => onAddRequest("need")}
            className="bg-white whitespace-nowrap"
          >
            <HelpCircle className="h-4 w-4 mr-2" />
            Request Skill
          </Button>

          {/* View Skill Requests button - changes color when active */}
          <Button 
            variant="outline" 
            onClick={onViewRequests}
            className={`whitespace-nowrap ${
              isViewingRequests 
                ? "bg-[#333333] text-white hover:bg-[#444444]" 
                : "bg-white hover:bg-gray-50"
            }`}
          >
            <List className="h-4 w-4 mr-2" />
            View Skill Requests
          </Button>
        </div>
      </div>
      
      {/* Description box with dynamic text */}
      <div className="bg-white/50 backdrop-blur-sm rounded-lg p-4">
        <p className="text-gray-700 text-sm">
          {getHeaderDescription()}
        </p>
      </div>
    </div>
  );
};

export default SkillsHeader;
