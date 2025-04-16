
import React from 'react';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';

// Type for location preference
export type LocationPreference = 'contributor_home' | 'requester_home' | 'other';

// Props interface for the LocationSelector component
interface LocationSelectorProps {
  value: LocationPreference;
  onChange: (value: LocationPreference) => void;
}

/**
 * Component for selecting the teaching location preference
 * Allows users to choose between their house, requester's house, or other location
 */
const LocationSelector = ({ value, onChange }: LocationSelectorProps) => {
  return (
    <div className="space-y-2">
      {/* Section label */}
      <Label>Where would you like to teach?</Label>
      
      {/* Radio group for location options */}
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
