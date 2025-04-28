
import React from 'react';
import { useState, useEffect } from "react";
import SkillsList from "@/components/skills/SkillsList";
import SkillsHeader from "@/components/skills/SkillsHeader";
import CategoryView from "@/components/skills/CategoryView";
import { SkillCategory } from "@/components/skills/types/skillTypes";
import { BookOpen, GraduationCap, Heart, Palette, Wrench, Code } from "lucide-react";
import { createHighlightListener } from "@/utils/highlightNavigation";
import ModuleLayout from "@/components/layout/ModuleLayout";
import { Button } from "@/components/ui/button"; // Import Button component
import AddSupportRequestDialog from "@/components/AddSupportRequestDialog"; // Import dialog

const categoryIcons = {
  creative: Palette,
  trade: Wrench,
  technology: Code,
  education: GraduationCap,
  wellness: Heart,
} as const;

/**
 * SkillsPage - Display and management of community skills
 * 
 * This page allows users to:
 * - Browse skills by category
 * - Search for specific skills
 * - Toggle between different views
 * - Access skill requests
 */
const SkillsPage = () => {
  const [showCategories, setShowCategories] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<SkillCategory | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showRequests, setShowRequests] = useState(false);
  
  // Add state for the dialog control
  const [isAddSkillOpen, setIsAddSkillOpen] = useState(false);
  const [dialogMode, setDialogMode] = useState<'offer' | 'need'>('offer');

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
      setSelectedCategory(null);
    } else {
      setSearchQuery('');
    }
  };

  const getCategoryIcon = (category: SkillCategory | null) => {
    if (!category) return BookOpen;
    return categoryIcons[category] || BookOpen;
  };
  
  // Function to open the dialog for adding skills
  const openSkillDialog = (mode: 'offer' | 'need') => {
    setDialogMode(mode);
    setIsAddSkillOpen(true);
  };

  return (
    <ModuleLayout
      title="Skills Exchange"
      themeColor="skills"
      description="Share your expertise and learn from others. Connect with neighbors to exchange skills, teach, learn, and grow together as a community."
    >
      {/* Modified header section with buttons on the right */}
      <div className="mb-6 flex items-center justify-between">
        {/* Left side - Icon and title */}
        <div className="flex items-center">
          {React.createElement(getCategoryIcon(selectedCategory), {
            className: "h-5 w-5 text-gray-700 mr-2"
          })}
          <h3 className="text-lg font-semibold text-gray-900">
            {showCategories ? 'Categories' : 
              (selectedCategory ? selectedCategory.charAt(0).toUpperCase() + selectedCategory.slice(1) : 
                searchQuery ? `Search: "${searchQuery}"` : 
                  showRequests ? 'Skill Requests' : 'All Skills')}
          </h3>
        </div>
        
        {/* Right side - Action buttons */}
        <div className="flex items-center gap-2">
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

      <SkillsHeader 
        showCategories={showCategories}
        onViewChange={handleViewChange}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        showRequests={showRequests}
        setShowRequests={setShowRequests}
        openSkillDialog={openSkillDialog}
      />
      
      {showCategories ? (
        <CategoryView onCategoryClick={handleCategoryClick} />
      ) : (
        <SkillsList 
          selectedCategory={selectedCategory}
          searchQuery={searchQuery}
          showRequests={showRequests}
        />
      )}
      
      {/* Dialog moved to the page level */}
      <AddSupportRequestDialog
        open={isAddSkillOpen}
        onOpenChange={setIsAddSkillOpen}
        initialRequestType={dialogMode}
        view="skills"
      />
    </ModuleLayout>
  );
};

export default SkillsPage;
