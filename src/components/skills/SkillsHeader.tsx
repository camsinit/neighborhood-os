
import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Plus, List, Grid } from "lucide-react";
import { useSkillsExchange } from "@/hooks/skills/useSkillsExchange";
import AddSupportRequestDialog from "../AddSupportRequestDialog";

interface SkillsHeaderProps {
  showCategories: boolean;
  onViewChange: () => void;
}

const SkillsHeader = ({ 
  showCategories, 
  onViewChange,
}: SkillsHeaderProps) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isAddSkillOpen, setIsAddSkillOpen] = useState(false);
  const [dialogMode, setDialogMode] = useState<'offer' | 'need'>('offer');

  const openSkillDialog = (mode: 'offer' | 'need') => {
    setDialogMode(mode);
    setIsAddSkillOpen(true);
  };

  return (
    <div className="flex items-center justify-between py-2 pb-6 flex-nowrap gap-4">
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
          variant="outline"
          onClick={onViewChange}
          className={`whitespace-nowrap hover:bg-[#F1F1F1] ${
            !showCategories ? 'bg-[#F1F1F1]' : 'bg-white'
          }`}
        >
          {showCategories ? (
            <>
              <List className="h-4 w-4 mr-2" />
              Show List View
            </>
          ) : (
            <>
              <Grid className="h-4 w-4 mr-2" />
              Show Categories
            </>
          )}
        </Button>
      </div>
      
      <div className="flex items-center gap-3 flex-shrink-0">
        <Button 
          variant="outline"
          onClick={() => openSkillDialog('need')}
          className="bg-[#0EA5E9] hover:bg-[#0EA5E9]/90 text-white whitespace-nowrap border-0"
        >
          <Plus className="h-4 w-4 mr-2" />
          Request Skill
        </Button>
        <Button 
          variant="outline"
          onClick={() => openSkillDialog('offer')} 
          className="bg-[#0EA5E9] hover:bg-[#0EA5E9]/90 text-white whitespace-nowrap border-0"
        >
          <Plus className="h-4 w-4 mr-2" />
          Offer Skill
        </Button>
      </div>

      <AddSupportRequestDialog
        open={isAddSkillOpen}
        onOpenChange={setIsAddSkillOpen}
        initialRequestType={dialogMode}
        view="skills"
      />
    </div>
  );
};

export default SkillsHeader;
