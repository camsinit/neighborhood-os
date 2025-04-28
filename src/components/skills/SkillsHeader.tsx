
import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Grid2x2, ArrowLeft } from "lucide-react";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";

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
  openSkillDialog // This prop is passed from the parent but not used directly in the header anymore
}: SkillsHeaderProps) => {
  // Log to help debug version issues
  useEffect(() => {
    console.log("[SkillsHeader] Component rendered, version: 2025-04-28");
    return () => console.log("[SkillsHeader] Component will unmount");
  }, []);

  // If user searches while in categories view, switch to list view automatically
  useEffect(() => {
    if (searchQuery && showCategories) {
      onViewChange();
    }
  }, [searchQuery, showCategories, onViewChange]);

  return (
    <div className="flex items-center justify-between py-2 pb-6 flex-nowrap gap-4">
      <div className="flex items-center gap-4">
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

        {/* Toggle group for offers/requests view - styled like Items page */}
        <ToggleGroup 
          type="single" 
          defaultValue={showRequests ? "requests" : "offers"} 
          className="bg-gray-100 rounded-md p-1"
          onValueChange={(value) => {
            // Only change state if a value is selected (prevents deselection)
            if (value) {
              setShowRequests(value === "requests");
            }
          }}
        >
          <ToggleGroupItem 
            value="offers" 
            className="text-sm px-4 py-1 data-[state=on]:bg-white data-[state=on]:shadow-sm rounded-md"
          >
            Offers
          </ToggleGroupItem>
          <ToggleGroupItem 
            value="requests" 
            className="text-sm px-4 py-1 data-[state=on]:bg-white data-[state=on]:shadow-sm rounded-md"
          >
            Requests
          </ToggleGroupItem>
        </ToggleGroup>
      </div>
    </div>
  );
};

export default SkillsHeader;
