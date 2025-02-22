
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';

export type LocationPreference = 'contributor_home' | 'requester_home' | 'other';

interface LocationSelectorProps {
  value: LocationPreference;
  onChange: (value: LocationPreference) => void;
}

const LocationSelector = ({ value, onChange }: LocationSelectorProps) => {
  return (
    <div className="space-y-2">
      <Label>Where would you like to teach?</Label>
      <RadioGroup value={value} onValueChange={onChange}>
        <div className="flex items-center space-x-2">
          <RadioGroupItem value="contributor_home" id="contributor_home" />
          <Label htmlFor="contributor_home">At my house</Label>
        </div>
        <div className="flex items-center space-x-2">
          <RadioGroupItem value="requester_home" id="requester_home" />
          <Label htmlFor="requester_home">At their house</Label>
        </div>
        <div className="flex items-center space-x-2">
          <RadioGroupItem value="other" id="other" />
          <Label htmlFor="other">Other location</Label>
        </div>
      </RadioGroup>
    </div>
  );
};

export default LocationSelector;
