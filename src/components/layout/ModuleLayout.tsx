import React, { useState } from 'react';
import { cn } from "@/lib/utils";
import ModuleHeader from './module/ModuleHeader';
import ModuleContent from './module/ModuleContent';
import ModuleContainer from './module/ModuleContainer';
import { ModuleLayoutProps } from '@/types/module';
import { Info, Users, Share2, Sparkles, Eye, ArrowRight, ArrowLeft } from 'lucide-react';
import { moduleThemeColors } from '@/theme/moduleTheme';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SkillsMiniSurvey } from "@/components/onboarding/survey/steps/skills/SkillsMiniSurvey";
import { useSkillsManagement } from "@/hooks/form/useSkillsManagement";
import { useUser } from "@supabase/auth-helpers-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { createLogger } from "@/utils/logger";
const logger = createLogger('ModuleLayoutSkillsOnboarding');

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
  onSkillsOnboardingComplete
}: ModuleLayoutProps) => {
  // State for onboarding flow within the overlay
  const [currentStep, setCurrentStep] = useState(0); // 0: welcome, 1-7: skills survey steps
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hasCompletedSurvey, setHasCompletedSurvey] = useState(false);
  const [skillsSurveyStep, setSkillsSurveyStep] = useState(0);
  const [skillsSurveyTotal, setSkillsSurveyTotal] = useState(7);
  const {
    toast
  } = useToast();
  const user = useUser();
  const {
    saveSkills
  } = useSkillsManagement();
  // Get theme colors for this module
  const themeConfig = moduleThemeColors[themeColor];

  /**
   * Handle completion of the skills survey within the overlay
   */
  const handleSkillsComplete = async () => {
    if (!user) {
      toast({
        title: "Error",
        description: "You must be logged in to save skills.",
        variant: "destructive"
      });
      return;
    }
    setIsSubmitting(true);
    try {
      // Get user's neighborhood ID
      const {
        data: membership
      } = await supabase.from('neighborhood_members').select('neighborhood_id').eq('user_id', user.id).eq('status', 'active').single();
      if (!membership) {
        throw new Error('User not found in any neighborhood');
      }

      // Save skills if any were selected
      if (selectedSkills.length > 0) {
        await saveSkills(selectedSkills, user.id, membership.neighborhood_id);
        logger.info("Skills saved successfully:", selectedSkills);
      }

      // Mark skills onboarding as completed
      const {
        error: profileError
      } = await supabase.from('profiles').update({
        completed_skills_onboarding: true
      }).eq('id', user.id);
      if (profileError) throw profileError;
      logger.info("Skills onboarding marked as completed");
      toast({
        title: "Skills Shared!",
        description: selectedSkills.length > 0 ? `Added ${selectedSkills.length} skills to your profile.` : "Skills onboarding completed. You can add skills anytime!"
      });

      // Call the completion handler from parent
      onSkillsOnboardingComplete?.();
    } catch (error) {
      logger.error("Error completing skills onboarding:", error);
      toast({
        title: "Error",
        description: "Failed to complete skills onboarding. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  /**
   * Handle survey state changes from SkillsMiniSurvey
   */
  const handleSurveyStateChange = (hasCompleted: boolean, hasSkills: boolean) => {
    setHasCompletedSurvey(hasCompleted);
  };

  /**
   * Handle mini-survey progress updates
   */
  const handleMiniSurveyProgress = (step: number, total: number, completed: boolean) => {
    setSkillsSurveyStep(step);
    setSkillsSurveyTotal(total);
  };

  /**
   * Calculate progress percentage based on current step and mini-survey progress
   */
  const getProgress = () => {
    const totalSteps = 1 + skillsSurveyTotal; // Welcome + 7 skills steps

    if (currentStep === 0) {
      return 1 / totalSteps * 100; // Welcome step completed
    }
    if (currentStep === 1) {
      // Progress within skills survey: welcome + current skills step
      const completedSteps = 1 + skillsSurveyStep + (hasCompletedSurvey ? 1 : 0);
      return completedSteps / totalSteps * 100;
    }
    return 0;
  };

  /**
   * Get current step display text
   */
  const getCurrentStepText = () => {
    if (currentStep === 0) {
      return "1 of 8";
    }
    if (currentStep === 1) {
      return `${2 + skillsSurveyStep} of 8`;
    }
    return "1 of 8";
  };
  return <div className={showSkillsOnboardingOverlay ? "relative min-h-screen" : "min-h-screen bg-gray-50"}>
      {/* Main content - conditionally blurred for skills onboarding */}
      <div className={showSkillsOnboardingOverlay ? "min-h-screen bg-gray-50 blur-sm" : ""}>
        {/* Header section with proper left-alignment */}
        <div className="max-w-7xl mx-auto px-6 lg:px-8 pt-8 pb-6">
          {/* Title - theme-colored and left-aligned */}
          <h1 className="text-3xl font-bold mb-4 text-left" style={{
          color: themeConfig.primary
        }}>
            {title}
          </h1>
          
          {/* Description box with gradient and colored border */}
          {description && <div className="rounded-lg p-4 border shadow-sm flex items-start gap-3" style={{
          background: `linear-gradient(to right, ${themeConfig.primary}20, ${themeConfig.primary}08 40%, white)`,
          borderColor: themeConfig.primary
        }}>
              <Info className="h-5 w-5 mt-0.5 shrink-0" style={{
            color: themeConfig.primary
          }} />
              <p className="text-sm text-left leading-relaxed text-black">
                {description}
              </p>
            </div>}
        </div>
        
        <div className="max-w-7xl mx-auto px-6 lg:px-8 pb-8">
          {/* Content without automatic container - let children handle their own styling */}
          {children}
        </div>
      </div>

      {/* Skills onboarding overlay with full onboarding flow */}
      {showSkillsOnboardingOverlay && <div className="absolute inset-0 flex items-center justify-center pointer-events-none p-6">
          <Card className="w-[600px] max-h-[90vh] overflow-y-auto pointer-events-auto">
            
            
            <CardContent>
              {/* Step 0: Welcome */}
              {currentStep === 0 && <div className="space-y-6 max-w-md mx-auto text-center">
                  {/* Welcome header */}
                   <div className="space-y-3">
                     <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto" style={{
                backgroundColor: `${themeConfig.primary}10`
              }}>
                       <Users className="w-8 h-8" style={{
                  color: themeConfig.primary
                }} />
                     </div>
                    <h2 className="text-xl font-bold">Welcome to Skills Sharing!</h2>
                    <p className="text-muted-foreground text-sm">
                      Build a stronger community by sharing and discovering neighborhood skills
                    </p>
                  </div>

                  {/* Simplified philosophy - condensed */}
                  <div className="space-y-4 text-sm">
                     <div className="flex items-start gap-3 text-left bg-muted/50 p-3 rounded-lg">
                       <Share2 className="w-4 h-4 mt-0.5 flex-shrink-0" style={{
                  color: themeConfig.primary
                }} />
                      <div>
                        <span className="font-medium">Share to Discover</span>
                        <p className="text-xs text-muted-foreground mt-1">
                          Share your skills first to view your neighbors' skills and create a fair exchange.
                        </p>
                      </div>
                    </div>

                     <div className="flex items-start gap-3 text-left bg-muted/50 p-3 rounded-lg">
                       <Eye className="w-4 h-4 mt-0.5 flex-shrink-0" style={{
                  color: themeConfig.primary
                }} />
                      <div>
                        <span className="font-medium">Privacy First</span>
                        <p className="text-xs text-muted-foreground mt-1">
                          You control what you share and can add or remove skills anytime.
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Call to action */}
                  <div className="space-y-4">
                     <Button onClick={() => setCurrentStep(1)} className="px-6" style={{
                backgroundColor: themeConfig.primary,
                borderColor: themeConfig.primary
              }}>
                       Get Started
                       <ArrowRight className="w-4 h-4 ml-2" />
                     </Button>
                  </div>
                </div>}
              
              {/* Step 1: Skills Survey */}
              {currentStep === 1 && <div className="space-y-4">
                  <SkillsMiniSurvey selectedSkills={selectedSkills} onSkillsChange={setSelectedSkills} onSurveyStateChange={handleSurveyStateChange} onMiniSurveyProgress={handleMiniSurveyProgress} onGoBackToWelcome={() => setCurrentStep(0)} progressInfo={{
              currentStep: skillsSurveyStep,
              totalSteps: 8,
              completedSteps: 1 + skillsSurveyStep + (hasCompletedSurvey ? 1 : 0),
              primaryColor: themeConfig.primary
            }} />
                  
                  {/* Complete button */}
                  {hasCompletedSurvey && <div className="flex justify-center pt-4 border-t">
                       <Button onClick={handleSkillsComplete} disabled={isSubmitting} className="min-w-[120px]" style={{
                backgroundColor: themeConfig.primary,
                borderColor: themeConfig.primary
              }}>
                         {isSubmitting ? "Saving..." : "Complete Setup"}
                       </Button>
                    </div>}
                 </div>}
               
                {/* Progress dots only show during skills survey, not welcome */}
                {currentStep === 1}
             </CardContent>
           </Card>
         </div>}
     </div>;
};
export default ModuleLayout;