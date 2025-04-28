import React from 'react';
import { useState, useEffect } from "react";
import SkillsList from "@/components/skills/SkillsList";
import SkillsHeader from "@/components/skills/SkillsHeader";
import CategoryView from "@/components/skills/CategoryView";
import { SkillCategory } from "@/components/skills/types/skillTypes";
import { BookOpen, GraduationCap, Heart, Palette, Wrench, Code } from "lucide-react";
import GlowingDescriptionBox from "@/components/ui/glowing-description-box";
import { createHighlightListener } from "@/utils/highlightNavigation";
import SkillRequestsButton from "@/components/skills/SkillRequestsButton";

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
    <div className="page-gradient skills-gradient">
      <div className="relative z-10">
        <div className="min-h-full w-full">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="py-8">
              <h2 className="text-2xl font-bold text-gray-900">Skills Exchange</h2>
              
              <div className="mt-4 bg-white/80 backdrop-blur-sm rounded-lg p-4 border border-gray-100 shadow-sm">
                <p className="text-gray-700 text-sm">
                  Share your expertise and learn from others. Connect with neighbors to exchange 
                  skills, teach, learn, and grow together as a community.
                </p>
              </div>

              <div className="bg-white/80 backdrop-blur-sm rounded-lg p-6 shadow-lg mt-6">
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
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SkillsPage;
