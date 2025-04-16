
import React from 'react';
import { Calendar } from '@/components/ui/calendar';
import { Label } from '@/components/ui/label';
import { format, addDays } from 'date-fns';
import { TimeSlot } from './TimeSlotSelector';
import { Info } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

/**
 * Props for the DateSelectionSection component
 */
interface DateSelectionSectionProps {
  selectedTimeSlots: TimeSlot[];
  onDateSelect: (date: Date) => void;
}

/**
 * Component for selecting dates for a skill contribution
 */
const DateSelectionSection: React.FC<DateSelectionSectionProps> = ({
  selectedTimeSlots,
  onDateSelect
}) => {
  const { toast } = useToast();
  
  // Limit date selection to future dates within 90 days
  const disabledDays = {
    before: new Date(),
    after: addDays(new Date(), 90)
  };

  // Convert selectedTimeSlots to Date objects for calendar display
  const selectedDates = selectedTimeSlots.map(slot => new Date(slot.date));

  /**
   * Handle calendar selection changes
   */
  const handleCalendarSelect = (value: Date[] | undefined) => {
    if (!value || !Array.isArray(value)) return;
    
    if (value.length !== selectedDates.length) {
      // Find the date that was added or removed
      if (value.length > selectedDates.length) {
        // A date was added - find which one
        const newDate = value.find(date => 
          !selectedDates.some(d => format(d, 'yyyy-MM-dd') === format(date, 'yyyy-MM-dd'))
        );
        if (newDate) onDateSelect(newDate);
      } else {
        // A date was removed - find which one
        const removedDate = selectedDates.find(date => 
          !value.some(d => format(d, 'yyyy-MM-dd') === format(date, 'yyyy-MM-dd'))
        );
        if (removedDate) onDateSelect(removedDate);
      }
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex items-start justify-between">
        <Label>Select dates when you're available</Label>
        <div className="text-xs text-primary flex items-center gap-1">
          <Info size={14} />
          <span>We recommend selecting 3 dates</span>
        </div>
      </div>
      <div className="border rounded-lg p-4">
        <Calendar
          mode="multiple"
          selected={selectedDates}
          onSelect={handleCalendarSelect}
          disabled={disabledDays}
          className="mx-auto pointer-events-auto"
        />
      </div>
      {/* Helper text showing count of selected dates */}
      <div className="text-sm text-gray-500 mt-1">
        {selectedTimeSlots.length} date{selectedTimeSlots.length !== 1 ? 's' : ''} selected
        {selectedTimeSlots.length === 0 && " (please select at least one date)"}
      </div>
    </div>
  );
};

export default DateSelectionSection;
