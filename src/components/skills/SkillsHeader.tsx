
import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Plus, HelpCircle, LayoutGrid, List } from "lucide-react";
import { useSkillsExchange } from "@/hooks/skills/useSkillsExchange";

interface SkillsHeaderProps {
  showCategories: boolean;
  onViewChange: () => void;
  onViewUserRequests: () => void;
  showUserRequestsOnly: boolean; // New prop to track the toggle state
}

// Component for the search bar and action buttons at the top of the skills page
const SkillsHeader = ({ 
  showCategories, 
  onViewChange,
  onViewUserRequests,
  showUserRequestsOnly
}: SkillsHeaderProps) => {
  const [searchQuery, setSearchQuery] = useState('');
  const { handleSubmit } = useSkillsExchange({
    onSuccess: () => {
      // Handle success
    }
  });

  return (
    <div className="flex items-center justify-between py-4 flex-nowrap gap-4">
      {/* Left side: Search and view toggle */}
      <div className="flex items-center gap-4">
        <div className="relative w-[200px] flex-shrink-0">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 h-4 w-4" />
          <Input 
            type="search" 
            placeholder="Search for skills..." 
            className="pl-10" 
            value={searchQuery} 
            onChange={e => setSearchQuery(e.target.value)} 
          />
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={onViewChange}
          className="flex-shrink-0"
        >
          {showCategories ? <List className="h-5 w-5" /> : <LayoutGrid className="h-5 w-5" />}
        </Button>
      </div>
      
      {/* Right side: Action buttons */}
      <div className="flex items-center gap-3 flex-shrink-0">
        <Button 
          variant="outline"
          onClick={() => handleSubmit({}, 'offer')} 
          className="bg-[#0EA5E9] hover:bg-[#0EA5E9]/90 text-white whitespace-nowrap border-0"
        >
          <Plus className="h-4 w-4 mr-2" />
          Offer Skill
        </Button>

        <Button 
          variant={showUserRequestsOnly ? "default" : "outline"}
          onClick={onViewUserRequests}
          className={`whitespace-nowrap ${showUserRequestsOnly ? 'bg-[#0EA5E9] text-white' : 'bg-white'}`}
        >
          <HelpCircle className="h-4 w-4 mr-2" />
          Request Skill
        </Button>
      </div>
    </div>
  );
};

export default SkillsHeader;
