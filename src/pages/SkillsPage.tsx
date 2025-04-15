import React from 'react';
import { useState, useEffect } from "react";
import SkillsList from "@/components/skills/SkillsList";
import SkillsHeader from "@/components/skills/SkillsHeader";
import CategoryView from "@/components/skills/CategoryView";
import { SkillCategory } from "@/components/skills/types/skillTypes";
import { BookOpen, GraduationCap, Heart, Palette, Wrench, Code } from "lucide-react";
import GlowingDescriptionBox from "@/components/ui/glowing-description-box";
import { createHighlightListener } from "@/utils/highlightNavigation";
import SkillRequestsPopover from "@/components/skills/SkillRequestsPopover"; // Import the new component
import { Button } from "@/components/ui/button";

const categoryIcons = {
  creative: Palette,
  trade: Wrench,
  technology: Code,
  education: GraduationCap,
  wellness: Heart,
} as const;

const SkillsPage = () => {
  // State for view control - default to ALL view (showCategories = false)
  const [showCategories, setShowCategories] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<SkillCategory | null>(null);
  
  // Search state
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const handleHighlightItem = createHighlightListener("skills");
    
    window.addEventListener('highlightItem', handleHighlightItem as EventListener);
    return () => {
      window.removeEventListener('highlightItem', handleHighlightItem as EventListener);
    };
  }, []);

  const handleCategoryClick = (category: SkillCategory) => {
    setSelectedCategory(category);
    setShowCategories(false);
  };

  const handleViewChange = () => {
    setShowCategories(!showCategories);
    if (showCategories) {
      // When switching to "All" view
      setSelectedCategory(null);
    } else {
      // When switching back to categories, clear search
      setSearchQuery('');
    }
  };

  const getCategoryIcon = (category: SkillCategory | null) => {
    if (!category) return BookOpen;
    return categoryIcons[category] || BookOpen;
  };

  const [isAddSkillOpen, setIsAddSkillOpen] = useState(false);
  const [dialogMode, setDialogMode] = useState<'offer' | 'need'>('offer');

  const openSkillDialog = (mode: 'offer' | 'need') => {
    setDialogMode(mode);
    setIsAddSkillOpen(true);
  };

  return (
    <div className="relative min-h-screen">
      <div 
        className="absolute inset-0 pointer-events-none" 
        style={{ 
          background: `linear-gradient(to bottom, hsla(var(--skills-color), 0.15) 0%, hsla(var(--skills-color), 0) 60%)`,
          zIndex: 0 
        }}
        aria-hidden="true"
      />
      
      <div className="relative z-10">
        <div className="min-h-full w-full bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="py-8">
              <h2 className="text-2xl font-bold text-gray-900">Skills Exchange</h2>
              
              <GlowingDescriptionBox colorClass="skills-color">
                <p className="text-gray-700 text-sm">
                  Share your expertise and learn from others. Connect with neighbors to exchange 
                  skills, teach, learn, and grow together as a community.
                </p>
              </GlowingDescriptionBox>

              <div className="bg-white rounded-lg p-6 shadow-lg">
                {/* Title and Category section moved above SkillsHeader */}
                <div className="mb-6 flex items-center justify-between">
                  <div className="flex items-center">
                    {React.createElement(getCategoryIcon(selectedCategory), {
                      className: "h-5 w-5 text-gray-700 mr-2"
                    })}
                    <h3 className="text-lg font-semibold text-gray-900">
                      {showCategories ? 'Categories' : (selectedCategory ? selectedCategory.charAt(0).toUpperCase() + selectedCategory.slice(1) : searchQuery ? `Search: "${searchQuery}"` : 'All Skills')}
                    </h3>
                  </div>
                  
                  {/* Buttons container */}
                  <div className="flex items-center gap-2">
                    <SkillRequestsPopover />
                    <Button 
                      variant="outline"
                      onClick={() => openSkillDialog('need')}
                      className="bg-[#0EA5E9] hover:bg-[#0284C7] text-white whitespace-nowrap border-0"
                    >
                      Request Skill
                    </Button>
                    <Button 
                      variant="outline"
                      onClick={() => openSkillDialog('offer')}
                      className="bg-[#0EA5E9] hover:bg-[#0284C7] text-white whitespace-nowrap border-0"
                    >
                      Offer Skill
                    </Button>
                  </div>
                </div>

                <SkillsHeader 
                  showCategories={showCategories}
                  onViewChange={handleViewChange}
                  searchQuery={searchQuery}
                  setSearchQuery={setSearchQuery}
                />
                
                {showCategories ? (
                  <CategoryView onCategoryClick={handleCategoryClick} />
                ) : (
                  <SkillsList 
                    selectedCategory={selectedCategory}
                    searchQuery={searchQuery}
                  />
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SkillsPage;
