
import React from 'react';
import { useState, useEffect } from "react";
import SkillsList from "@/components/skills/SkillsList";
import SkillsHeader from "@/components/skills/SkillsHeader";
import CategoryView from "@/components/skills/CategoryView";
import { SkillCategory } from "@/components/skills/types/skillTypes";
import { BookOpen, GraduationCap, Heart, Palette, Wrench, Code } from "lucide-react";
import { createHighlightListener } from "@/utils/highlightNavigation";
import ModuleLayout from "@/components/layout/ModuleLayout";

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

  return (
    <ModuleLayout
      title="Skills Exchange"
      themeColor="skills"
      description="Share your expertise and learn from others. Connect with neighbors to exchange skills, teach, learn, and grow together as a community."
    >
      <div className="mb-6 flex items-center">
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

      <SkillsHeader 
        showCategories={showCategories}
        onViewChange={handleViewChange}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        showRequests={showRequests}
        setShowRequests={setShowRequests}
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
    </ModuleLayout>
  );
};

export default SkillsPage;
