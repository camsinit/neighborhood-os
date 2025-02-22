
import { format } from 'date-fns';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';

// Time options for each date
export const TIME_OPTIONS = [
  { id: 'morning', label: 'Morning (9am-12pm)' },
  { id: 'afternoon', label: 'Afternoon (1pm-5pm)' },
  { id: 'evening', label: 'Evening (6pm-9pm)' },
];

export interface TimeSlot {
  date: Date;
  preferences: string[];
}

interface TimeSlotSelectorProps {
  timeSlot: TimeSlot;
  onRemove: () => void;
  onPreferenceChange: (timeId: string) => void;
}

const TimeSlotSelector = ({ timeSlot, onRemove, onPreferenceChange }: TimeSlotSelectorProps) => {
  return (
    <div className="border rounded-lg p-4 space-y-2">
      <div className="flex justify-between items-center">
        <Label>{format(timeSlot.date, 'EEEE, MMMM d, yyyy')}</Label>
        <Button
          variant="ghost"
          size="sm"
          onClick={onRemove}
        >
          Remove
        </Button>
      </div>
      <div className="grid gap-2">
        {TIME_OPTIONS.map((time) => (
          <div key={time.id} className="flex items-center space-x-2">
            <Checkbox
              id={`${timeSlot.date.toISOString()}-${time.id}`}
              checked={timeSlot.preferences.includes(time.id)}
              onCheckedChange={() => onPreferenceChange(time.id)}
            />
            <Label htmlFor={`${timeSlot.date.toISOString()}-${time.id}`}>{time.label}</Label>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TimeSlotSelector;
