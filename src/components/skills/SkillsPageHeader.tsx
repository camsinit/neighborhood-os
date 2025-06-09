
import React from 'react';
import { ModuleContainer, ModuleContent, ModuleHeader } from '@/components/layout/module';

/**
 * SkillsPageHeader - Header section for the Skills page
 * 
 * This component renders the page header with title and description.
 * It's been extracted from the main SkillsPage for better organization.
 */
interface SkillsPageHeaderProps {
  children: React.ReactNode;
}

const SkillsPageHeader: React.FC<SkillsPageHeaderProps> = ({ children }) => {
  return (
    <ModuleContainer themeColor="skills">
      {/* Header with improved spacing */}
      <ModuleHeader 
        title="Skills Exchange"
        themeColor="skills"
      />
      
      {/* Full-width description box with consistent padding - moved outside ModuleHeader */}
      <div className="max-w-7xl mx-auto px-6 lg:px-10 mb-6 sm:px-[25px]">
        <div className="module-description bg-white/80 backdrop-blur-sm rounded-lg p-4 border border-gray-100 shadow-sm mx-0 px-[16px]">
          <p className="text-gray-700 text-sm">Share skills and knowledge with your neighbors</p>
        </div>
      </div>
      
      <ModuleContent className="px-4 sm:px-6 lg:px-8">
        <div className="module-card">
          {children}
        </div>
      </ModuleContent>
    </ModuleContainer>
  );
};

export default SkillsPageHeader;
