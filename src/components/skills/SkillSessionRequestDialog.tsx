
/**
 * Dialog component for requesting a skill session
 * 
 * This component has been refactored for better maintainability and readability
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

/**
 * Props for the dialog component
 */
interface SkillSessionRequestDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  skillId: string;
  skillTitle: string;
  providerId: string;
}

/**
 * A dialog component for requesting a skill session
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

  // Custom hook for form submission logic
  const { isSubmitting, submitSkillRequest } = useSkillRequestSubmit(
    skillId, 
    providerId, 
    () => onOpenChange(false)
  );

  // Settings for the date picker
  const disabledDays = {
    before: new Date(),
    after: addDays(new Date(), 90) // Limit date selection to 90 days in the future
  };

  /**
   * Validates the time slots before submission
   * Returns true if valid, false otherwise
   */
  const validateTimeSlots = () => {
    // Check if at least 1 date is selected
    if (selectedTimeSlots.length < 1) {
      toast.error("Date selection required", {
        description: "Please select at least one date for your request"
      });
      return false;
    }

    // Validate that each date has at least one time preference selected
    if (selectedTimeSlots.some(slot => slot.preferences.length === 0)) {
      toast.error("Time preferences required", {
        description: "Please select at least one time preference for each selected date"
      });
      return false;
    }

    // Validate that at least 3 unique dates are selected
    // NEW: Extract just the date part (YYYY-MM-DD) from each ISO string
    const uniqueDates = new Set(
      selectedTimeSlots.map(slot => new Date(slot.date).toISOString().split('T')[0])
    );
    
    // Log detailed info about unique dates
    console.log("VALIDATION - Unique dates check:", {
      selectedSlotsCount: selectedTimeSlots.length,
      uniqueDatesCount: uniqueDates.size,
      uniqueDates: Array.from(uniqueDates),
      allDateStrings: selectedTimeSlots.map(slot => new Date(slot.date).toISOString().split('T')[0])
    });
    
    if (uniqueDates.size < 3) {
      toast.error(`At least 3 different dates required`, {
        description: `You have selected ${uniqueDates.size} unique dates. Please select at least 3 different dates.`
      });
      return false;
    }

    return true;
  };

  /**
   * Form submission handler that validates the form data before submitting
   */
  const onSubmit = async (data: SkillRequestFormData) => {
    console.log("Form submitted with time slots:", selectedTimeSlots);
    
    // Validate time slots
    if (!validateTimeSlots()) {
      return;
    }
    
    // If validation passes, submit the request
    await submitSkillRequest(data, selectedTimeSlots);
  };

  return (
    <TooltipProvider>
      <UniversalDialog
        open={open}
        onOpenChange={onOpenChange}
        title={`Request Help with: ${skillTitle}`}
      >
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
