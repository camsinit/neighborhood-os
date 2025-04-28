
import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Grid2x2, ArrowLeft } from "lucide-react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"; // Changed from ToggleGroup to Tabs

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

        {/* Tabs for offers/requests view - styled to exactly match the image */}
        <Tabs 
          value={showRequests ? "requests" : "offers"}
          onValueChange={(value) => {
            // Only change state if a value is selected
            setShowRequests(value === "requests");
          }}
          className="w-auto"
        >
          {/* Setting bg-slate-100 for the lighter background color shown in the image */}
          <TabsList className="bg-slate-100 p-1 rounded-full">
            <TabsTrigger 
              value="offers" 
              className="px-6 py-1.5 data-[state=active]:bg-white data-[state=active]:shadow-sm rounded-full font-medium"
            >
              Available
            </TabsTrigger>
            <TabsTrigger 
              value="requests" 
              className="px-6 py-1.5 data-[state=active]:bg-white data-[state=active]:shadow-sm rounded-full text-slate-500 font-medium"
            >
              Requests
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>
    </div>
  );
};

export default SkillsHeader;
