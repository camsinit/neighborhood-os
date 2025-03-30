import React from 'react';
import { useState, useEffect } from "react";
import SkillsList from "@/components/skills/SkillsList";
import SkillsHeader from "@/components/skills/SkillsHeader";
import CategoryView from "@/components/skills/CategoryView";
import { SkillCategory } from "@/components/skills/types/skillTypes";
import { BookOpen, GraduationCap, Heart, Palette, Wrench, Code } from "lucide-react";
import GlowingDescriptionBox from "@/components/ui/glowing-description-box";
import { createHighlightListener } from "@/utils/highlightNavigation";

const categoryIcons = {
  creative: Palette,
  trade: Wrench,
  technology: Code,
  education: GraduationCap,
  wellness: Heart,
} as const;

const SkillsPage = () => {
  const [showCategories, setShowCategories] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<SkillCategory | null>(null);

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

  const getCategoryIcon = (category: SkillCategory | null) => {
    if (!category) return BookOpen;
    return categoryIcons[category] || BookOpen;
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
                <SkillsHeader 
                  showCategories={showCategories}
                  onViewChange={() => {
                    setShowCategories(!showCategories);
                    setSelectedCategory(null);
                  }}
                />
                
                <div className="flex items-center gap-2 mb-6">
                  {React.createElement(getCategoryIcon(selectedCategory), {
                    className: "h-5 w-5 text-gray-700"
                  })}
                  <h3 className="text-lg font-semibold text-gray-900">
                    {showCategories ? 'Categories' : (selectedCategory ? selectedCategory.charAt(0).toUpperCase() + selectedCategory.slice(1) : 'All Skills')}
                  </h3>
                </div>
                
                {showCategories ? (
                  <CategoryView onCategoryClick={handleCategoryClick} />
                ) : (
                  <SkillsList 
                    selectedCategory={selectedCategory}
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
