
import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Grid2x2, ArrowLeft } from "lucide-react";
import { useSkillsExchange } from "@/hooks/skills/useSkillsExchange";
import AddSupportRequestDialog from "../AddSupportRequestDialog";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";

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
        {/* Request and Offer buttons - Moved from the bottom to here */}
        <Button 
          variant="outline"
          onClick={() => openSkillDialog('need')}
          className="bg-[#22C55E] hover:bg-[#16A34A] text-white whitespace-nowrap border-0 hover:text-white"
        >
          Request
        </Button>
        <Button 
          variant="outline"
          onClick={() => openSkillDialog('offer')} 
          className="bg-[#22C55E] hover:bg-[#16A34A] text-white whitespace-nowrap border-0 hover:text-white"
        >
          Offer
        </Button>

        {/* Search input field */}
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

        {/* Toggle button */}
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

        {/* Toggle group for offers/requests view */}
        <ToggleGroup type="single" defaultValue={showRequests ? "requests" : "offers"} 
          onValueChange={(value) => {
            // Only change state if a value is selected (prevents deselection)
            if (value) {
              setShowRequests(value === "requests");
            }
          }}
        >
          <ToggleGroupItem value="offers" className="text-sm">Offers</ToggleGroupItem>
          <ToggleGroupItem value="requests" className="text-sm">Requests</ToggleGroupItem>
        </ToggleGroup>
      </div>

      {/* Removed the buttons div since buttons were moved to the top */}

      {/* Dialog */}
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
