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
  const { currentPage, goToNext, isFirstStep, isLastStep } = useWaitlistSurveyNavigation();
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
  return <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <Button variant="ghost" size="sm" onClick={onClose} className="h-6 w-6 p-0">
              <X className="h-4 w-4" />
            </Button>
            <h3 className="text-lg font-semibold absolute left-1/2 transform -translate-x-1/2">Additional Information</h3>
            <div></div>
          </DialogTitle>
        </DialogHeader>

        {/* Progress indicator */}
        <div className="flex justify-center space-x-2 mb-0">
          <div className={cn("h-2 w-2 rounded-full", currentPage === 0 ? "bg-blue-600" : "bg-gray-300")} />
          <div className={cn("h-2 w-2 rounded-full", currentPage === 1 ? "bg-blue-600" : "bg-gray-300")} />
        </div>

        {/* Carousel content */}
        <div className="min-h-[300px] py-0 -mt-4">
          {isFirstStep ? (
            <WaitlistSurveyStep1 formData={formData} onFieldChange={updateField} />
          ) : (
            <WaitlistSurveyStep2 formData={formData} onFieldChange={updateField} />
          )}
        </div>

        {/* Navigation buttons */}
        <div className="flex justify-between pt-4">
          <button 
            type="button"
            onClick={() => {
              toast({
                title: "Thanks for your interest!",
                description: "We'll keep you in the loop on all neighborhoodOS updates!"
              });
              onClose();
            }}
            className="text-sm text-muted-foreground hover:text-foreground underline transition-colors"
          >
            I just want to stay in the loop
          </button>

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
    </Dialog>;
};
export default WaitlistSurveyPopover;