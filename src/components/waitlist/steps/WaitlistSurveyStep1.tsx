
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SurveyData } from "../hooks/useWaitlistSurveyForm";

interface WaitlistSurveyStep1Props {
  formData: SurveyData;
  onFieldChange: (field: keyof SurveyData, value: string | number) => void;
}

/**
 * Essential information step for waitlist survey
 */
export const WaitlistSurveyStep1 = ({ 
  formData, 
  onFieldChange 
}: WaitlistSurveyStep1Props) => {
  return (
    <div className="space-y-4 pt-5 -mb-2.5">
      {/* Name fields */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="firstName">First Name</Label>
          <Input 
            id="firstName" 
            value={formData.firstName} 
            onChange={e => onFieldChange('firstName', e.target.value)} 
            placeholder="Enter your first name" 
          />
        </div>
        <div>
          <Label htmlFor="lastName">Last Name</Label>
          <Input 
            id="lastName" 
            value={formData.lastName} 
            onChange={e => onFieldChange('lastName', e.target.value)} 
            placeholder="Enter your last name" 
          />
        </div>
      </div>

      {/* Neighborhood name */}
      <div>
        <Label htmlFor="neighborhoodName">Neighborhood Name</Label>
        <Input 
          id="neighborhoodName" 
          value={formData.neighborhoodName} 
          onChange={e => onFieldChange('neighborhoodName', e.target.value)} 
          placeholder="e.g., Sunset District, Capitol Hill" 
        />
      </div>

      {/* City and State */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="city">City</Label>
          <Input 
            id="city" 
            value={formData.city} 
            onChange={e => onFieldChange('city', e.target.value)} 
            placeholder="Enter your city" 
          />
        </div>
        <div>
          <Label htmlFor="state">State</Label>
          <Input 
            id="state" 
            value={formData.state} 
            onChange={e => onFieldChange('state', e.target.value)} 
            placeholder="e.g., CA, NY" 
          />
        </div>
      </div>
    </div>
  );
};
