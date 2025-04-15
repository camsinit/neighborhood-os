
import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Grid2x2, ArrowLeft, BookOpen } from "lucide-react";
import { useSkillsExchange } from "@/hooks/skills/useSkillsExchange";
import AddSupportRequestDialog from "../AddSupportRequestDialog";
import SkillRequestsButton from "./SkillRequestsPopover"; // Updated import name

interface SkillsHeaderProps {
  showCategories: boolean;
  onViewChange: () => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  showRequests: boolean;
  setShowRequests: (show: boolean) => void;
}

const SkillsHeader = ({ 
  showCategories, 
  onViewChange,
  searchQuery,
  setSearchQuery,
  showRequests,
  setShowRequests
}: SkillsHeaderProps) => {
  const [isAddSkillOpen, setIsAddSkillOpen] = useState(false);
  const [dialogMode, setDialogMode] = useState<'offer' | 'need'>('offer');

  useEffect(() => {
    if (searchQuery && showCategories) {
      onViewChange();
    }
  }, [searchQuery, showCategories, onViewChange]);

  const openSkillDialog = (mode: 'offer' | 'need') => {
    setDialogMode(mode);
    setIsAddSkillOpen(true);
  };

  return (
    <div className="flex items-center justify-between py-2 pb-6 flex-nowrap gap-4">
      <div className="flex items-center gap-4">
        <Button
          variant="outline"
          onClick={onViewChange}
          className={`whitespace-nowrap hover:bg-[#F1F1F1] ${
            !showCategories ? 'bg-[#F1F1F1]' : 'bg-white'
          }`}
        >
          {!showCategories ? (
            <>
              <Grid2x2 className="h-4 w-4 mr-2" />
              Types
            </>
          ) : (
            <>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </>
          )}
        </Button>

        <SkillRequestsButton
          isActive={showRequests}
          onClick={() => setShowRequests(!showRequests)}
        />

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
      </div>

      <div className="flex items-center gap-4">
        <Button 
          variant="outline"
          onClick={() => openSkillDialog('need')}
          className="bg-[#0EA5E9] hover:bg-[#0284C7] text-white whitespace-nowrap border-0"
        >
          Request
        </Button>
        <Button 
          variant="outline"
          onClick={() => openSkillDialog('offer')} 
          className="bg-[#0EA5E9] hover:bg-[#0284C7] text-white whitespace-nowrap border-0"
        >
          Offer
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
