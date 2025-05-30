
import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Grid2x2, ArrowLeft, ChevronDown } from "lucide-react";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuItem
} from "@/components/ui/dropdown-menu"; // Import dropdown components

/**
 * Props for the SkillsHeader component
 */
interface SkillsHeaderProps {
  showCategories: boolean;
  onViewChange: () => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  showRequests: boolean;
  setShowRequests: (show: boolean) => void;
  // Function to open the skill dialog
  openSkillDialog: (mode: 'offer' | 'need') => void;
}

/**
 * SkillsHeader - The navigation header for the Skills Exchange page
 * 
 * This component allows users to toggle between different views,
 * search for skills, and filter between offers and requests.
 */
const SkillsHeader = ({ 
  showCategories, 
  onViewChange,
  searchQuery,
  setSearchQuery,
  showRequests,
  setShowRequests,
  openSkillDialog
}: SkillsHeaderProps) => {
  // Log to help debug version issues
  useEffect(() => {
    console.log("[SkillsHeader] Component rendered, version: 2025-05-11");
    return () => console.log("[SkillsHeader] Component will unmount");
  }, []);

  // If user searches while in categories view, switch to list view automatically
  useEffect(() => {
    if (searchQuery && showCategories) {
      onViewChange();
    }
  }, [searchQuery, showCategories, onViewChange]);

  return (
    <div className="flex items-center justify-between py-1 pb-4 flex-nowrap gap-2">
      <div className="flex items-center gap-2">
        {/* Search input field - Reduced width and adjusted left padding */}
        <div className="relative w-[160px] flex-shrink-0">
          <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-500 h-4 w-4" />
          <Input 
            type="search" 
            placeholder="Search skills..." 
            className="pl-8" 
            value={searchQuery} 
            onChange={e => setSearchQuery(e.target.value)} 
          />
        </div>

        {/* Toggle button - Changed background to white/gray and text from "Types" to "Categories" */}
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
              Categories
            </>
          ) : (
            <>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </>
          )}
        </Button>

        {/* Dropdown menu replacing the tabs */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button 
              variant="outline" 
              className="bg-slate-100 hover:bg-slate-200"
            >
              {showRequests ? 'Requests' : 'Available'}
              <ChevronDown className="ml-2 h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="bg-white w-[130px]">
            <DropdownMenuItem 
              className={`font-medium ${!showRequests ? 'bg-slate-100' : ''}`}
              onClick={() => setShowRequests(false)}
            >
              Available
            </DropdownMenuItem>
            <DropdownMenuItem 
              className={`font-medium ${showRequests ? 'bg-slate-100' : ''}`}
              onClick={() => setShowRequests(true)}
            >
              Requests
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Action buttons - Direct click without popovers */}
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
      </div>
    </div>
  );
};

export default SkillsHeader;
