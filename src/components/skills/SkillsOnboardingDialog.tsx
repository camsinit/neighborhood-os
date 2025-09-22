import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { ArrowLeft } from "lucide-react";
import { SkillsOnboardingWelcome } from "./SkillsOnboardingWelcome";
import { SkillsMiniSurvey } from "../onboarding/survey/steps/skills/SkillsMiniSurvey";
import { useSkillsManagement } from "@/hooks/form/useSkillsManagement";
import { useUser } from "@supabase/auth-helpers-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { createLogger } from "@/utils/logger";

const logger = createLogger('SkillsOnboardingDialog');

/**
 * SkillsOnboardingDialog Component
 * 
 * Modal dialog that guides users through skills onboarding on the Skills page.
 * Includes welcome step explaining the "contribute to view" philosophy,
 * followed by the existing SkillsMiniSurvey component.
 */
interface SkillsOnboardingDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onComplete: () => void;
  isTestMode?: boolean;
}

export const SkillsOnboardingDialog = ({ 
  open, 
  onOpenChange, 
  onComplete,
  isTestMode = false 
}: SkillsOnboardingDialogProps) => {
  const [currentStep, setCurrentStep] = useState(0); // 0: welcome, 1: skills survey
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hasCompletedSurvey, setHasCompletedSurvey] = useState(false);
  
  const { toast } = useToast();
  const user = useUser();
  const { saveSkills } = useSkillsManagement();

  /**
   * Handle completion of the skills survey
   */
  const handleSkillsComplete = async () => {
    if (isTestMode) {
      // In test mode, just complete without saving
      logger.info("Test mode: Skills onboarding completed without saving");
      onComplete();
      return;
    }

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

      onComplete();
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

  /**
   * Handle dialog close - prevent closing during submission
   */
  const handleOpenChange = (open: boolean) => {
    if (!open && isSubmitting) return; // Prevent closing during submission
    onOpenChange(open);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[1200px] max-h-[98vh] overflow-y-auto">
        {/* Test mode indicator */}
        {isTestMode && (
          <div className="bg-amber-50 border border-amber-200 rounded px-3 py-2 text-amber-700 text-sm mb-4">
            <strong>Test Mode:</strong> No changes will be saved to your profile
          </div>
        )}

        {/* Header */}
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle>
              {currentStep === 0 ? "Skills Sharing" : "Select Your Skills"}
            </DialogTitle>
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
          <DialogDescription>
            {currentStep === 0 
              ? "Learn about sharing skills with your neighborhood community"
              : "Choose the skills you'd like to share with your neighbors"
            }
          </DialogDescription>
          
          {/* Progress bar */}
          <div className="space-y-2">
            <Progress value={getProgress()} className="w-full" />
            <p className="text-xs text-muted-foreground text-center">
              Step {currentStep + 1} of 2
            </p>
          </div>
        </DialogHeader>

        {/* Content */}
        <div className="py-4">
          {currentStep === 0 && (
            <SkillsOnboardingWelcome 
              onNext={() => setCurrentStep(1)} 
            />
          )}
          
          {currentStep === 1 && (
            <div className="space-y-4">
              <SkillsMiniSurvey
                selectedSkills={selectedSkills}
                onSkillsChange={setSelectedSkills}
                onSurveyStateChange={handleSurveyStateChange}
                onGoBackToWelcome={() => setCurrentStep(0)}
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
        </div>
      </DialogContent>
    </Dialog>
  );
};