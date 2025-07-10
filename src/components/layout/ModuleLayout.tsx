
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
import { Progress } from "@/components/ui/progress";
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
  const [currentStep, setCurrentStep] = useState(0); // 0: welcome, 1: skills survey
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hasCompletedSurvey, setHasCompletedSurvey] = useState(false);
  
  const { toast } = useToast();
  const user = useUser();
  const { saveSkills } = useSkillsManagement();
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
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    
    try {
      // Get user's neighborhood ID
      const { data: membership } = await supabase
        .from('neighborhood_members')
        .select('neighborhood_id')
        .eq('user_id', user.id)
        .eq('status', 'active')
        .single();

      if (!membership) {
        throw new Error('User not found in any neighborhood');
      }

      // Save skills if any were selected
      if (selectedSkills.length > 0) {
        await saveSkills(selectedSkills, user.id, membership.neighborhood_id);
        logger.info("Skills saved successfully:", selectedSkills);
      }

      // Mark skills onboarding as completed
      const { error: profileError } = await supabase
        .from('profiles')
        .update({ completed_skills_onboarding: true })
        .eq('id', user.id);

      if (profileError) throw profileError;

      logger.info("Skills onboarding marked as completed");
      
      toast({
        title: "Skills Shared!",
        description: selectedSkills.length > 0 
          ? `Added ${selectedSkills.length} skills to your profile.`
          : "Skills onboarding completed. You can add skills anytime!",
      });

      // Call the completion handler from parent
      onSkillsOnboardingComplete?.();
    } catch (error) {
      logger.error("Error completing skills onboarding:", error);
      toast({
        title: "Error",
        description: "Failed to complete skills onboarding. Please try again.",
        variant: "destructive",
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
   * Calculate progress percentage
   */
  const getProgress = () => {
    if (currentStep === 0) return 25;
    if (currentStep === 1 && !hasCompletedSurvey) return 50;
    if (currentStep === 1 && hasCompletedSurvey) return 100;
    return 0;
  };
  
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

      {/* Skills onboarding overlay with full onboarding flow */}
      {showSkillsOnboardingOverlay && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none p-6">
          <Card className="max-w-2xl w-full max-h-[90vh] overflow-y-auto pointer-events-auto">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>
                  {currentStep === 0 ? "Skills Sharing" : "Select Your Skills"}
                </CardTitle>
                {currentStep === 1 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setCurrentStep(0)}
                    disabled={isSubmitting}
                  >
                    <ArrowLeft className="w-4 h-4 mr-1" />
                    Back
                  </Button>
                )}
              </div>
              
              {/* Progress bar */}
              <div className="space-y-2">
                <Progress value={getProgress()} className="w-full" />
                <p className="text-xs text-muted-foreground text-center">
                  Step {currentStep + 1} of 2
                </p>
              </div>
            </CardHeader>
            
            <CardContent>
              {/* Step 0: Welcome */}
              {currentStep === 0 && (
                <div className="space-y-6 max-w-md mx-auto">
                  {/* Welcome header */}
                  <div className="text-center space-y-2">
                    <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Users className="w-8 h-8 text-primary" />
                    </div>
                    <h2 className="text-xl font-bold">Welcome to Skills Sharing!</h2>
                    <p className="text-muted-foreground text-sm">
                      Build a stronger community by sharing and discovering neighborhood skills
                    </p>
                  </div>

                  {/* Philosophy explanation */}
                  <div className="space-y-3">
                    <Card>
                      <CardHeader className="pb-3">
                        <CardTitle className="text-sm flex items-center gap-2">
                          <Share2 className="w-4 h-4" />
                          Share to Discover
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="pt-0">
                        <p className="text-xs text-muted-foreground">
                          To view your neighbors' skills, we ask that you first share your own. 
                          This creates a fair exchange where everyone contributes to the community.
                        </p>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader className="pb-3">
                        <CardTitle className="text-sm flex items-center gap-2">
                          <Eye className="w-4 h-4" />
                          Privacy First
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="pt-0">
                        <p className="text-xs text-muted-foreground">
                          You control what you share and can add or remove skills at any time. 
                          Only share what you're comfortable offering to your neighbors.
                        </p>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Call to action */}
                  <div className="text-center space-y-4">
                    <p className="text-sm text-muted-foreground">
                      Ready to share your skills and discover what your neighbors have to offer?
                    </p>
                    <Button onClick={() => setCurrentStep(1)} className="w-full">
                      Get Started
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </div>
                </div>
              )}
              
              {/* Step 1: Skills Survey */}
              {currentStep === 1 && (
                <div className="space-y-4">
                  <SkillsMiniSurvey
                    selectedSkills={selectedSkills}
                    onSkillsChange={setSelectedSkills}
                    onSurveyStateChange={handleSurveyStateChange}
                  />
                  
                  {/* Complete button */}
                  {hasCompletedSurvey && (
                    <div className="flex justify-center pt-4 border-t">
                      <Button 
                        onClick={handleSkillsComplete}
                        disabled={isSubmitting}
                        className="min-w-[120px]"
                      >
                        {isSubmitting ? "Saving..." : "Complete Setup"}
                      </Button>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default ModuleLayout;
