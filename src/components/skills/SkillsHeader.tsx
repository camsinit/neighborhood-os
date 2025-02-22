
import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Plus, HelpCircle } from "lucide-react";
import { useSkillsExchange } from "@/hooks/skills/useSkillsExchange";

// Component for the search bar and action buttons at the top of the skills page
const SkillsHeader = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const { handleSubmit } = useSkillsExchange({
    onSuccess: () => {
      // Handle success
    }
  });

  return (
    <div className="flex items-center justify-between py-4 flex-nowrap">
      {/* Search input with icon */}
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
      
      {/* Action buttons */}
      <div className="flex items-center gap-3 flex-shrink-0">
        {/* Offer Skill button */}
        <Button 
          variant="outline"
          onClick={() => handleSubmit({}, 'offer')} 
          className="bg-[#0EA5E9] hover:bg-[#0EA5E9]/90 text-white whitespace-nowrap border-0"
        >
          <Plus className="h-4 w-4 mr-2" />
          Offer Skill
        </Button>

        {/* Request Skill button */}
        <Button 
          variant="outline" 
          onClick={() => handleSubmit({}, 'request')}
          className="bg-white whitespace-nowrap"
        >
          <HelpCircle className="h-4 w-4 mr-2" />
          Request Skill
        </Button>
      </div>
    </div>
  );
};

export default SkillsHeader;
