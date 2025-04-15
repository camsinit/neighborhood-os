import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Grid2x2, ArrowLeft, MessageSquarePlus } from "lucide-react";
import { useSkillsExchange } from "@/hooks/skills/useSkillsExchange";
import AddSupportRequestDialog from "../AddSupportRequestDialog";

interface SkillsHeaderProps {
  showCategories: boolean;
  onViewChange: () => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  showRequests: boolean;
  setShowRequests: (show: boolean) => void;
}

/**
 * SkillsHeader - The navigation header for the Skills Exchange page
 * 
 * This component allows users to toggle between different views,
 * search for skills, and create new skill offers or requests.
 */
const SkillsHeader = ({ 
  showCategories, 
  onViewChange,
  searchQuery,
  setSearchQuery,
  showRequests,
  setShowRequests
}: SkillsHeaderProps) => {
  // State for the add skill dialog
  const [isAddSkillOpen, setIsAddSkillOpen] = useState(false);
  const [dialogMode, setDialogMode] = useState<'offer' | 'need'>('offer');

  // If user searches while in categories view, switch to list view automatically
  useEffect(() => {
    if (searchQuery && showCategories) {
      onViewChange();
    }
  }, [searchQuery, showCategories, onViewChange]);

  // Function to open the dialog for adding skills
  const openSkillDialog = (mode: 'offer' | 'need') => {
    setDialogMode(mode);
    setIsAddSkillOpen(true);
  };

  return (
    <div className="flex items-center justify-between py-2 pb-6 flex-nowrap gap-4">
      <div className="flex items-center gap-4">
        {/* Search input field - now between Types and Skill Requests */}
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

        {/* Toggle button to switch between categories and list view */}
        <Button
          variant="outline"
          onClick={onViewChange}
          className={`whitespace-nowrap hover:bg-gray-200 ${
            !showCategories ? 'bg-gray-100' : 'bg-white'
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

        {/* Toggle button for switching between offers and requests */}
        <Button 
          variant="outline" 
          size="default"
          className={`gap-2 hover:bg-gray-200 ${showRequests ? 'bg-gray-100' : 'bg-white'}`}
          onClick={() => setShowRequests(!showRequests)}
        >
          <MessageSquarePlus className="h-4 w-4" />
          <span>Skill Requests</span>
        </Button>
      </div>

      <div className="flex items-center gap-4">
        {/* Request and Offer buttons with consistent hover styling */}
        <Button 
          variant="outline"
          onClick={() => openSkillDialog('need')}
          className="bg-[#0EA5E9] hover:bg-[#0284C7] text-white whitespace-nowrap border-0 hover:text-white"
        >
          Request
        </Button>
        <Button 
          variant="outline"
          onClick={() => openSkillDialog('offer')} 
          className="bg-[#0EA5E9] hover:bg-[#0284C7] text-white whitespace-nowrap border-0 hover:text-white"
        >
          Offer
        </Button>
      </div>

      {/* Dialog for creating new skill offers/requests */}
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
