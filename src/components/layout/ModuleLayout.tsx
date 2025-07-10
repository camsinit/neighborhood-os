
import React from 'react';
import { cn } from "@/lib/utils";
import ModuleHeader from './module/ModuleHeader';
import ModuleContent from './module/ModuleContent';
import ModuleContainer from './module/ModuleContainer';
import { ModuleLayoutProps } from '@/types/module';
import { Info, Users, Share2, Sparkles } from 'lucide-react';
import { moduleThemeColors } from '@/theme/moduleTheme';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

/**
 * ModuleLayout Component
 * 
 * This is the foundational layout component for all module pages.
 * It provides consistent structure and styling while ensuring proper left-alignment
 * for all key elements (title, description, and content).
 * 
 * @param children - The main content to be displayed in the module
 * @param title - The title of the module/page
 * @param description - Optional description text for the module/page
 * @param themeColor - The theme color identifier for the module (e.g., 'calendar', 'skills')
 * @param className - Optional additional classes
 */
const ModuleLayout = ({
  children,
  title,
  description,
  themeColor,
  className,
  showSkillsOnboardingOverlay = false,
  onStartSkillsOnboarding
}: ModuleLayoutProps) => {
  // Get theme colors for this module
  const themeConfig = moduleThemeColors[themeColor];
  
  return (
    <div className={showSkillsOnboardingOverlay ? "relative min-h-screen" : "min-h-screen bg-gray-50"}>
      {/* Main content - conditionally blurred for skills onboarding */}
      <div className={showSkillsOnboardingOverlay ? "min-h-screen bg-gray-50 blur-sm" : ""}>
        {/* Header section with proper left-alignment */}
        <div className="max-w-7xl mx-auto px-6 lg:px-8 pt-8 pb-6">
          {/* Title - theme-colored and left-aligned */}
          <h1 
            className="text-3xl font-bold mb-4 text-left"
            style={{ color: themeConfig.primary }}
          >
            {title}
          </h1>
          
          {/* Description box with gradient and colored border */}
          {description && (
            <div 
              className="rounded-lg p-4 border shadow-sm flex items-start gap-3"
              style={{ 
                background: `linear-gradient(to right, ${themeConfig.primary}20, ${themeConfig.primary}08 40%, white)`,
                borderColor: themeConfig.primary
              }}
            >
              <Info 
                className="h-5 w-5 mt-0.5 shrink-0" 
                style={{ color: themeConfig.primary }}
              />
              <p className="text-sm text-left leading-relaxed text-black">
                {description}
              </p>
            </div>
          )}
        </div>
        
        <div className="max-w-7xl mx-auto px-6 lg:px-8 pb-8">
          {/* Content without automatic container - let children handle their own styling */}
          {children}
        </div>
      </div>

      {/* Skills onboarding welcome overlay with call-to-action */}
      {showSkillsOnboardingOverlay && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none p-6">
          <Card className="max-w-md w-full pointer-events-auto">
            <CardHeader className="text-center">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="w-8 h-8 text-primary" />
              </div>
              <CardTitle className="text-xl">Welcome to Skills Sharing!</CardTitle>
            </CardHeader>
            
            <CardContent className="space-y-4">
              <p className="text-center text-muted-foreground">
                To view your neighbors' skills and abilities, we ask that you first share your own. 
                This creates a fair community where everyone contributes.
              </p>
              
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <Share2 className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-medium text-sm">Share Your Skills</p>
                    <p className="text-xs text-muted-foreground">
                      Let neighbors know what you can help with
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <Sparkles className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-medium text-sm">Discover Local Talent</p>
                    <p className="text-xs text-muted-foreground">
                      Find neighbors who can help with what you need
                    </p>
                  </div>
                </div>
              </div>
              
              {onStartSkillsOnboarding && (
                <Button 
                  onClick={onStartSkillsOnboarding} 
                  className="w-full mt-6"
                  size="lg"
                >
                  Share My Skills
                </Button>
              )}
              
              <p className="text-xs text-center text-muted-foreground">
                Takes just 2 minutes • You can update anytime
              </p>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default ModuleLayout;
