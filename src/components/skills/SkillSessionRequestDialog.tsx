
/**
 * Dialog component for requesting a skill session
 * 
 * This component has been updated to support multi-provider skill requests
 */
import { useState } from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import UniversalDialog from "@/components/ui/universal-dialog";
import { Form } from "@/components/ui/form";
import { addDays } from "date-fns";
import { TimeSlot } from "./contribution/TimeSlotSelector";
import TimeSlotSelectionSection from "./TimeSlotSelectionSection";
import DescriptionField from "./request-dialog/DescriptionField";
import { 
  useSkillRequestSubmit,
  SkillRequestFormData 
} from "./request-dialog/useSkillRequestSubmit";
import { TooltipProvider } from "@/components/ui/tooltip";
import { toast } from "sonner";
import { validateTimeSlots } from "@/utils/timeslotUtils";

/**
 * Props for the dialog component
 * (Note: providerId is now optional to support our multi-provider flow)
 */
interface SkillSessionRequestDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  skillId: string;
  skillTitle: string;
  providerId?: string; // Now optional - if not provided, will send to all providers
}

/**
 * A dialog component for requesting a skill session
 * Updated to support multi-provider requests when no providerId is specified
 */
const SkillSessionRequestDialog = ({
  open,
  onOpenChange,
  skillId,
  skillTitle,
  providerId,
}: SkillSessionRequestDialogProps) => {
  // State management
  const [selectedTimeSlots, setSelectedTimeSlots] = useState<TimeSlot[]>([]);
  
  // Initialize form
  const form = useForm<SkillRequestFormData>({
    defaultValues: {
      description: '',
      availability: 'both',
      timePreference: ['morning', 'afternoon', 'evening'],
    },
  });

  // Custom hook for form submission logic - updated to handle multi-provider flow
  const { isSubmitting, submitSkillRequest } = useSkillRequestSubmit(
    skillId, 
    () => onOpenChange(false),
    providerId // This can be undefined now for multi-provider requests
  );

  // Settings for the date picker
  const disabledDays = {
    before: new Date(),
    after: addDays(new Date(), 90) // Limit date selection to 90 days in the future
  };

  /**
   * Form submission handler that validates the form data before submitting
   */
  const onSubmit = async (data: SkillRequestFormData) => {
    console.log("Form submitted with time slots:", selectedTimeSlots);
    
    // Validate time slots - require at least 1 date with time preferences
    const validationResult = validateTimeSlots(selectedTimeSlots);
    if (!validationResult.isValid) {
      toast.error(validationResult.message, {
        description: "Please select at least one date with time preferences"
      });
      return;
    }
    
    // We recommend providing multiple dates for scheduling flexibility, but only require 1
    const uniqueDatesSet = new Set(
      selectedTimeSlots.map(slot => new Date(slot.date).toISOString().split('T')[0])
    );
    
    if (uniqueDatesSet.size < 1) {
      toast.error("Please select at least 1 date", {
        description: "You must provide at least one date for your request."
      });
      return;
    } else if (uniqueDatesSet.size < 3) {
      // Just a warning, not an error - we'll proceed with the submission
      toast.warning("Consider adding more dates", {
        description: "For better scheduling flexibility, we recommend providing at least 3 different dates."
      });
      // Still proceed with submission despite the warning
    }
    
    // If validation passes, submit the request
    await submitSkillRequest(data, selectedTimeSlots);
  };

  // Determine the title based on whether this is a specific provider or multi-provider request
  const dialogTitle = providerId 
    ? `Request Help with: ${skillTitle}` 
    : `Request Help with: ${skillTitle} (Multiple Providers)`;

  return (
    <TooltipProvider>
      <UniversalDialog
        open={open}
        onOpenChange={onOpenChange}
        title={dialogTitle}
      >
        {/* Display an informational message for multi-provider requests */}
        {!providerId && (
          <div className="bg-blue-50 text-blue-700 p-3 rounded-md mb-4 text-sm">
            This request will be sent to all neighbors who can help with this skill. 
            The first provider to claim your request will be matched with you.
          </div>
        )}
        
        {/* Wrap everything in a Form component with the onSubmit handler */}
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 py-0">
            {/* Description Field */}
            <DescriptionField form={form} />

            {/* Date and Time Selection Section - now with full width */}
            <div className="space-y-2 w-full">
              <TimeSlotSelectionSection
                selectedTimeSlots={selectedTimeSlots}
                setSelectedTimeSlots={setSelectedTimeSlots}
                disabledDays={disabledDays}
                requiredDatesCount={1} // We only require 1 date minimum
              />
            </div>

            {/* Form Controls */}
            <div className="flex justify-end space-x-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Submitting...' : 'Submit Request'}
              </Button>
            </div>
          </form>
        </Form>
      </UniversalDialog>
    </TooltipProvider>
  );
};

export default SkillSessionRequestDialog;
