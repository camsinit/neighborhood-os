import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Share2, Eye, ArrowRight } from "lucide-react";

/**
 * SkillsOnboardingWelcome Component
 * 
 * Welcome step that explains the Skills page philosophy and the "contribute to view" approach.
 * Shown at the beginning of the skills onboarding process to set expectations.
 */
interface SkillsOnboardingWelcomeProps {
  onNext: () => void;
}

export const SkillsOnboardingWelcome = ({ onNext }: SkillsOnboardingWelcomeProps) => {
  return (
    <div className="space-y-6 max-w-md mx-auto">
      {/* Welcome header */}
      <div className="text-center space-y-2">
        <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
          <Users className="w-8 h-8 text-primary" />
        </div>
        <h2 className="text-2xl font-bold">Welcome to Skills Sharing!</h2>
        <p className="text-muted-foreground">
          Build a stronger community by sharing and discovering neighborhood skills
        </p>
      </div>

      {/* Philosophy explanation */}
      <div className="space-y-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Share2 className="w-4 h-4" />
              Share to Discover
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <p className="text-sm text-muted-foreground">
              To view your neighbors' skills, we ask that you first share your own. 
              This creates a fair exchange where everyone contributes to the community.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Eye className="w-4 h-4" />
              Privacy First
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <p className="text-sm text-muted-foreground">
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
        <Button onClick={onNext} className="w-full">
          Get Started
          <ArrowRight className="w-4 h-4 ml-2" />
        </Button>
      </div>
    </div>
  );
};