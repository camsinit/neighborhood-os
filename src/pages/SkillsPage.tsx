
import React from 'react';
import { useState, useEffect } from "react";
import SkillsList from "@/components/skills/SkillsList";
import SkillsHeader from "@/components/skills/SkillsHeader";
import CategoryView from "@/components/skills/CategoryView";
import { SkillCategory } from "@/components/skills/types/skillTypes";
import { BookOpen, GraduationCap, Heart, Palette, Wrench, Code } from "lucide-react";
import { createHighlightListener } from "@/utils/highlight"; // Updated import path
import ModuleLayout from "@/components/layout/ModuleLayout";
import { Button } from "@/components/ui/button";
import AddSupportRequestDialog from "@/components/AddSupportRequestDialog";
import { toast } from "sonner"; // Import toast for notification

// Object mapping skill categories to their respective icons
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
 * - Offer or request skills via dialog forms
 */
const SkillsPage = () => {
  // Log version info to help with debugging
  useEffect(() => {
    console.log("[SkillsPage] Component mounted, version: 2025-04-28 updated");
  }, []);
  
  // State for controlling page views and filters
  const [showCategories, setShowCategories] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<SkillCategory | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showRequests, setShowRequests] = useState(false);
  
  // State for dialog control - offering or requesting skills
  const [isAddSkillOpen, setIsAddSkillOpen] = useState(false);
  const [dialogMode, setDialogMode] = useState<'offer' | 'need'>('offer');

  // Set up event listener for navigation highlighting
  useEffect(() => {
    // Create a handler for the highlightItem event to mark this page as active
    const handleHighlightItem = createHighlightListener("skills");
    
    // Add the event listener when component mounts
    window.addEventListener('highlightItem', handleHighlightItem as EventListener);
    
    // Log to help debug version issues
    console.log("[SkillsPage] Component mounted, version: 2025-04-28");
    
    // Clean up event listener when component unmounts
    return () => {
      window.removeEventListener('highlightItem', handleHighlightItem as EventListener);
      console.log("[SkillsPage] Component unmounted");
    };
  }, []);

  // Handles selecting a specific skill category
  const handleCategoryClick = (category: SkillCategory) => {
    setSelectedCategory(category);
    setShowCategories(false);
  };

  // Toggles between category view and list view
  const handleViewChange = () => {
    setShowCategories(!showCategories);
    if (showCategories) {
      setSelectedCategory(null);
    } else {
      setSearchQuery('');
    }
  };

  // Helper to get the appropriate icon for a category
  const getCategoryIcon = (category: SkillCategory | null) => {
    if (!category) return BookOpen;
    return categoryIcons[category] || BookOpen;
  };
  
  // Function to open the dialog for adding skills
  const openSkillDialog = (mode: 'offer' | 'need') => {
    // Notify user we're opening the dialog with a quick toast
    toast.info(mode === 'offer' ? "Ready to share your skills!" : "Looking for help with something?");
    setDialogMode(mode);
    setIsAddSkillOpen(true);
  };

  return (
    <ModuleLayout
      title="Skills Exchange"
      themeColor="skills"
      description="Share your expertise and learn from others. Connect with neighbors to exchange skills, teach, learn, and grow together as a community."
    >
      {/* Main header section with icon, title and action buttons */}
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
      </div>

      {/* Search, filters and view toggles - Now passing the openSkillDialog function to SkillsHeader */}
      <SkillsHeader 
        showCategories={showCategories}
        onViewChange={handleViewChange}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        showRequests={showRequests}
        setShowRequests={setShowRequests}
        openSkillDialog={openSkillDialog}
      />
      
      {/* Main content - either categories or list of skills */}
      {showCategories ? (
        <CategoryView onCategoryClick={handleCategoryClick} />
      ) : (
        <SkillsList 
          selectedCategory={selectedCategory}
          searchQuery={searchQuery}
          showRequests={showRequests}
        />
      )}
      
      {/* Dialog for adding new skills */}
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
