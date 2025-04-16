/**
 * Dialog component for requesting a skill session
 * 
 * This component has been refactored for better maintainability and readability
 */
import { useState } from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
// Replace DialogWrapper with UniversalDialog
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
   * Form submission handler
   */
  const onSubmit = async (data: SkillRequestFormData) => {
    await submitSkillRequest(data, selectedTimeSlots);
  };

  return (
    <TooltipProvider>
      <UniversalDialog
        open={open}
        onOpenChange={onOpenChange}
        title={`Request Help with: ${skillTitle}`}
      >
        <div className="space-y-6 py-4">
          {/* Request title display */}
          <div className="text-center mb-6">
            <h4 className="text-sm font-medium text-gray-500">Contributing to request</h4>
            <p className="text-lg font-semibold text-gray-900">{skillTitle}</p>
          </div>

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
        </div>
      </Form>
    </UniversalDialog>
  </TooltipProvider>
  );
};

export default SkillSessionRequestDialog;
