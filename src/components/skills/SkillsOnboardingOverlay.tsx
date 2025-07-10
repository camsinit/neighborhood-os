import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Share2, Sparkles } from "lucide-react";

/**
 * SkillsOnboardingOverlay Component
 * 
 * Blur overlay that covers the Skills page content until user completes skills onboarding.
 * Provides a compelling call-to-action to encourage users to share their skills.
 */
interface SkillsOnboardingOverlayProps {
  onStartOnboarding: () => void;
}

export const SkillsOnboardingOverlay = ({ onStartOnboarding }: SkillsOnboardingOverlayProps) => {
  return (
    <div className="absolute inset-0 z-10 bg-background/80 backdrop-blur-sm flex items-center justify-center p-6">
      <Card className="max-w-md w-full">
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
          
          <Button 
            onClick={onStartOnboarding} 
            className="w-full mt-6"
            size="lg"
          >
            Share My Skills
          </Button>
          
          <p className="text-xs text-center text-muted-foreground">
            Takes just 2 minutes • You can update anytime
          </p>
        </CardContent>
      </Card>
    </div>
  );
};