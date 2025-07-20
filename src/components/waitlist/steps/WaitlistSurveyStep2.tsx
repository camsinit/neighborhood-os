
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { SurveyData } from "../hooks/useWaitlistSurveyForm";

interface WaitlistSurveyStep2Props {
  formData: SurveyData;
  onFieldChange: (field: keyof SurveyData, value: string | number) => void;
}

/**
 * Additional questions step for waitlist survey
 */
export const WaitlistSurveyStep2 = ({ 
  formData, 
  onFieldChange 
}: WaitlistSurveyStep2Props) => {
  return (
    <div className="space-y-6 pt-0.5">
      <div className="text-center mb-6">
        {/* Space for any intro text if needed */}
      </div>

      {/* Number of neighbors */}
      <div>
        <Label htmlFor="neighborsCount">
          If you had an account today, how many neighbors could you text an invite code to today?
        </Label>
        <Input 
          id="neighborsCount" 
          type="number" 
          min="0" 
          max="100" 
          value={formData.neighborsToOnboard === 0 ? "" : formData.neighborsToOnboard} 
          onChange={e => onFieldChange('neighborsToOnboard', parseInt(e.target.value) || 0)} 
          placeholder="Enter number" 
          className="mt-2" 
        />
      </div>

      {/* AI Coding Experience */}
      <div>
        <Label htmlFor="aiExperience">Do you have any experience with AI coding?</Label>
        <Select 
          value={formData.aiCodingExperience} 
          onValueChange={value => onFieldChange('aiCodingExperience', value)}
        >
          <SelectTrigger className="mt-2">
            <SelectValue placeholder="Select your experience level" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="None">None - I haven't used AI for coding</SelectItem>
            <SelectItem value="Beginner">Beginner - I've tried AI coding tools a few times</SelectItem>
            <SelectItem value="Intermediate">Intermediate - I use AI coding tools regularly</SelectItem>
            <SelectItem value="Advanced">Advanced - I'm very comfortable with AI coding</SelectItem>
            <SelectItem value="Expert">Expert - I'm highly skilled with AI coding tools</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Open Source Interest */}
      <div className="pb-4">
        <Label htmlFor="openSourceInterest">Are you interested in open-source software?</Label>
        <Select 
          value={formData.openSourceInterest} 
          onValueChange={value => onFieldChange('openSourceInterest', value)}
        >
          <SelectTrigger className="mt-2">
            <SelectValue placeholder="Select your interest level" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Not Interested">Not Interested</SelectItem>
            <SelectItem value="Not Very Interested">Not Very Interested</SelectItem>
            <SelectItem value="Somewhat Interested">Somewhat Interested</SelectItem>
            <SelectItem value="Interested">Interested</SelectItem>
            <SelectItem value="Very Interested">Very Interested</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
};
