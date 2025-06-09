
import React from 'react';
import { ModuleContainer, ModuleContent } from '@/components/layout/module';

/**
 * SkillsPageHeader - Header section for the Skills page
 * 
 * This component renders the page header with title and description.
 * Updated to display description below the title and use green color for title.
 */
interface SkillsPageHeaderProps {
  children: React.ReactNode;
}

const SkillsPageHeader: React.FC<SkillsPageHeaderProps> = ({ children }) => {
  return (
    <ModuleContainer themeColor="skills">
      {/* Header with title and description below it */}
      <div className="max-w-7xl mx-auto px-6 lg:px-10 pt-8 pb-6 sm:px-[25px]">
        <div className="flex flex-col gap-4">
          <h1 className="text-3xl font-bold text-green-500">Skill Sharing</h1>
          <div className="module-description bg-white/80 backdrop-blur-sm rounded-lg p-4 border border-gray-100 shadow-sm max-w-md">
            <p className="text-gray-700 text-sm">Share skills and knowledge with your neighbors</p>
          </div>
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
