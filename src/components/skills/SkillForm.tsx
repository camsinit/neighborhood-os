
import { Button } from "@/components/ui/button";
import { DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useState } from "react";
import { SkillFormData, SkillFormProps } from "./types/skillFormTypes";
import { useSupportRequestSubmit } from "@/hooks/support/useSupportRequestSubmit";

const SkillForm = ({ onClose, mode }: SkillFormProps) => {
  const [formData, setFormData] = useState<Partial<SkillFormData>>({
    category: 'tech',
    timePreference: [],
  });

  const { handleSubmit } = useSupportRequestSubmit({
    onSuccess: () => {
      onClose();
    }
  });

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    handleSubmit({
      title: formData.title,
      description: formData.description,
      category: 'skills',
      requestType: mode === 'offer' ? 'offer' : 'need',
      supportType: 'ongoing',
      validUntil: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // Default to 1 year from now
      skill_category: formData.category,
    });
  };

  const handleTimePreferenceChange = (value: string) => {
    setFormData(prev => {
      const currentPreferences = prev.timePreference || [];
      const newPreferences = currentPreferences.includes(value as TimePreference)
        ? currentPreferences.filter(p => p !== value)
        : [...currentPreferences, value as TimePreference];
      return { ...prev, timePreference: newPreferences };
    });
  };

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="category">Skill Category</Label>
        <Select 
          value={formData.category} 
          onValueChange={(value: any) => setFormData(prev => ({ ...prev, category: value }))}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="tech">Technology</SelectItem>
            <SelectItem value="creative">Creative</SelectItem>
            <SelectItem value="trade">Trade</SelectItem>
            <SelectItem value="education">Education</SelectItem>
            <SelectItem value="wellness">Wellness</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="title">
          {mode === 'offer' ? 'What skill can you teach?' : 'What skill do you want to learn?'}
        </Label>
        <Input
          id="title"
          value={formData.title || ''}
          onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
          placeholder={mode === 'offer' ? 'e.g., Python Programming' : 'e.g., Learn Python Programming'}
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">
          {mode === 'offer' 
            ? 'Describe your experience and teaching approach' 
            : 'Describe what you want to learn and your current level'}
        </Label>
        <Textarea
          id="description"
          value={formData.description || ''}
          onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
          placeholder={mode === 'offer' 
            ? 'Share your expertise and how you plan to teach others'
            : 'Explain what specific aspects you want to learn and your goals'
          }
          required
        />
      </div>

      {mode === 'offer' && (
        <>
          <div className="space-y-2">
            <Label htmlFor="availability">Availability</Label>
            <Select 
              value={formData.availability} 
              onValueChange={(value: any) => setFormData(prev => ({ ...prev, availability: value }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select availability" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="weekdays">Weekdays</SelectItem>
                <SelectItem value="weekends">Weekends</SelectItem>
                <SelectItem value="both">Both</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Preferred Times (Select all that apply)</Label>
            <div className="flex flex-wrap gap-2">
              {['morning', 'afternoon', 'evening'].map((time) => (
                <Button
                  key={time}
                  type="button"
                  variant={formData.timePreference?.includes(time as TimePreference) ? 'default' : 'outline'}
                  onClick={() => handleTimePreferenceChange(time)}
                  className="flex-1"
                >
                  {time.charAt(0).toUpperCase() + time.slice(1)}
                </Button>
              ))}
            </div>
          </div>
        </>
      )}

      {mode === 'request' && (
        <div className="space-y-2">
          <Label htmlFor="experienceLevel">Your Experience Level</Label>
          <Select 
            value={formData.experienceLevel} 
            onValueChange={(value: any) => setFormData(prev => ({ ...prev, experienceLevel: value }))}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select your level" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="beginner">Beginner</SelectItem>
              <SelectItem value="intermediate">Intermediate</SelectItem>
              <SelectItem value="advanced">Advanced</SelectItem>
            </SelectContent>
          </Select>
        </div>
      )}

      <DialogFooter>
        <Button type="submit">
          {mode === 'offer' ? 'Offer Skill' : 'Request Skill'}
        </Button>
      </DialogFooter>
    </form>
  );
};

export default SkillForm;
