import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { X, ChevronRight } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { useWaitlistSurveyForm } from "./hooks/useWaitlistSurveyForm";
import { useWaitlistSurveyNavigation } from "./hooks/useWaitlistSurveyNavigation";
import { useWaitlistSurveySubmit } from "./hooks/useWaitlistSurveySubmit";
import { WaitlistSurveyStep1 } from "./steps/WaitlistSurveyStep1";
import { WaitlistSurveyStep2 } from "./steps/WaitlistSurveyStep2";

/**
 * Props for the WaitlistSurveyPopover component
 */
interface WaitlistSurveyPopoverProps {
  isOpen: boolean;
  onClose: () => void;
  userEmail: string; // Pre-populated from the waitlist form
}

/**
 * WaitlistSurveyPopover Component
 * 
 * A dialog that appears after someone joins the waitlist to collect
 * additional information for prioritizing onboarding. Uses a carousel
 * to navigate between essential info and additional questions.
 */
const WaitlistSurveyPopover = ({
  isOpen,
  onClose,
  userEmail
}: WaitlistSurveyPopoverProps) => {
  const { toast } = useToast();
  
  // Custom hooks for form management
  const { formData, updateField, validateStep1, validateStep2 } = useWaitlistSurveyForm(userEmail);
  const { currentPage, goToNext, goToPrevious, isFirstStep, isLastStep } = useWaitlistSurveyNavigation();
  const { isSubmitting, submitSurvey } = useWaitlistSurveySubmit(onClose);

  /**
   * Check if current page can be completed
   */
  const canProceed = () => {
    return isFirstStep ? validateStep1() : validateStep2();
  };

  /**
   * Handle form submission
   */
  const handleSubmit = () => {
    submitSurvey(formData);
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-center">
            <div className="flex flex-col items-center text-center">
              <h3 className="text-lg font-semibold whitespace-nowrap">Join Neighborhood Waitlist</h3>
              <p className="text-sm text-gray-600 mt-1">Jump the waitlist by adding your neighborhood info below.</p>
            </div>
          </DialogTitle>
        </DialogHeader>

        {/* Carousel content */}
        <div className="min-h-[340px] py-0 -mt-4 -mb-4">
          {isFirstStep ? (
            <WaitlistSurveyStep1 formData={formData} onFieldChange={updateField} />
          ) : (
            <WaitlistSurveyStep2 formData={formData} onFieldChange={updateField} />
          )}
        </div>

        {/* Navigation buttons */}
        <div className="flex justify-between pt-4">
          {isFirstStep ? (
            <button 
              type="button"
              onClick={async () => {
                try {
                  // Call join-waitlist function to ensure confirmation email is sent
                  const response = await fetch('https://nnwzfliblfuldwxpuata.supabase.co/functions/v1/join-waitlist', {
                    method: 'POST',
                    headers: {
                      'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ email: userEmail }),
                  });

                  const result = await response.json();
                  
                  toast({
                    title: "Thanks for your interest!",
                    description: "We'll keep you in the loop on all neighborhoodOS updates! Check your email for confirmation."
                  });
                } catch (error) {
                  toast({
                    title: "Thanks for your interest!",
                    description: "We'll keep you in the loop on all neighborhoodOS updates!"
                  });
                }
                onClose();
              }}
              className="text-sm text-blue-600 hover:text-blue-700 underline transition-colors"
            >
              I just want to stay in the loop
            </button>
          ) : (
            <Button 
              variant="outline" 
              onClick={goToPrevious}
              className="flex items-center gap-2"
            >
              Back
            </Button>
          )}

          {isFirstStep ? (
            <Button onClick={goToNext} disabled={!canProceed()} className="flex items-center gap-2">
              Next
              <ChevronRight className="h-4 w-4" />
            </Button>
          ) : (
            <Button onClick={handleSubmit} disabled={!canProceed() || isSubmitting} className="flex items-center gap-2">
              {isSubmitting ? "Submitting..." : "Submit"}
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default WaitlistSurveyPopover;
