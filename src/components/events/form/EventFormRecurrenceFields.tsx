
import { Switch } from "@/components/ui/switch";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

/**
 * Props for the EventFormRecurrenceFields component
 */
interface EventFormRecurrenceFieldsProps {
  isRecurring: boolean;
  setIsRecurring: (isRecurring: boolean) => void;
  recurrencePattern: string;
  setRecurrencePattern: (pattern: string) => void;
  recurrenceEndDate: string;
  setRecurrenceEndDate: (date: string) => void;
}

/**
 * Component that renders the recurrence fields for the event form
 * 
 * This component handles all recurrence-related settings like whether the event
 * recurs, how often, and until when.
 */
const EventFormRecurrenceFields = ({
  isRecurring,
  setIsRecurring,
  recurrencePattern,
  setRecurrencePattern,
  recurrenceEndDate,
  setRecurrenceEndDate
}: EventFormRecurrenceFieldsProps) => {
  return (
    <>
      {/* Recurring Event Toggle - UI only feature (not stored in DB yet) */}
      <div className="flex items-center space-x-2">
        <Switch
          id="recurring"
          checked={isRecurring}
          onCheckedChange={setIsRecurring}
        />
        <Label htmlFor="recurring">Recurring Event</Label>
      </div>
      
      {/* Recurrence Options (shown only if event is recurring) - UI only feature */}
      {isRecurring && (
        <>
          <div className="space-y-2 pl-6 border-l-2 border-gray-100">
            <Label>Recurrence Pattern</Label>
            <RadioGroup
              value={recurrencePattern}
              onValueChange={setRecurrencePattern}
              className="flex flex-col space-y-1"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="daily" id="daily" />
                <Label htmlFor="daily">Daily</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="weekly" id="weekly" />
                <Label htmlFor="weekly">Weekly</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="bi-weekly" id="bi-weekly" />
                <Label htmlFor="bi-weekly">Bi-weekly</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="monthly" id="monthly" />
                <Label htmlFor="monthly">Monthly</Label>
              </div>
            </RadioGroup>
          </div>
          <div className="space-y-2 pl-6 border-l-2 border-gray-100">
            <Label htmlFor="endDate">End Date (optional)</Label>
            <Input
              id="endDate"
              type="date"
              value={recurrenceEndDate}
              onChange={(e) => setRecurrenceEndDate(e.target.value)}
              required={isRecurring}
            />
          </div>
        </>
      )}
    </>
  );
};

export default EventFormRecurrenceFields;
