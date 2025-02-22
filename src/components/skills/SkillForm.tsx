
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
import { useSkillsExchange } from "@/hooks/skills/useSkillsExchange";
import { useToast } from "@/hooks/use-toast";
import { AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { SkillCategory } from "./types/skillTypes";
import { useSkillDuplicateCheck } from "@/hooks/skills/useSkillDuplicateCheck";

// Types for the form
interface SkillFormProps {
  onClose: () => void;
  mode: 'offer' | 'request';
}

type TimePreference = 'morning' | 'afternoon' | 'evening';

interface SkillFormData {
  title?: string;
  description?: string;
  category?: SkillCategory;
  availability?: 'weekdays' | 'weekends' | 'both';
  timePreference?: TimePreference[];
}

const SkillForm = ({ onClose, mode }: SkillFormProps) => {
  // State to store form data
  const [formData, setFormData] = useState<SkillFormData>({
    category: 'technology',
    timePreference: [],
  });
  
  // Custom hooks for toast and skill submission
  const { toast } = useToast();
  const { handleSubmit } = useSkillsExchange({
    onSuccess: () => {
      // Show success toast with notification about matching
      toast({
        title: mode === 'offer' 
          ? "Skill offered successfully" 
          : "Skill requested successfully",
        description: mode === 'offer' 
          ? "Your neighbors with matching skill requests will be notified" 
          : "Your neighbors with matching skill offers will be notified",
      });
      onClose();
    }
  });

  // Check for duplicate skills
  const { data: duplicates, isLoading: checkingDuplicates } = useSkillDuplicateCheck(formData, mode);

  // Show warning if duplicates are found
  const duplicateWarning = duplicates && duplicates.length > 0 
    ? `Similar ${mode === 'offer' ? 'offerings' : 'requests'} exist in this category` 
    : null;

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.category) {
      toast({
        title: "Category required",
        description: "Please select a skill category",
        variant: "destructive"
      });
      return;
    }

    // If duplicates exist, show a warning toast but still allow submission
    if (duplicates && duplicates.length > 0) {
      toast({
        title: "Similar skills exist",
        description: "You can still submit, but consider checking existing skills first",
        variant: "destructive"
      });
    }

    handleSubmit(formData, mode);
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
          onValueChange={(value: SkillCategory) => setFormData(prev => ({ ...prev, category: value }))}
          required
        >
          <SelectTrigger>
            <SelectValue placeholder="Select category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="technology">Technology</SelectItem>
            <SelectItem value="creative">Creative</SelectItem>
            <SelectItem value="trade">Trade Skills</SelectItem>
            <SelectItem value="education">Education</SelectItem>
            <SelectItem value="wellness">Wellness</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="title">
          {mode === 'offer' ? 'What skill can you teach?' : 'What would you like to learn?'}
        </Label>
        <div className="space-y-2">
          <Input
            id="title"
            value={formData.title || ''}
            onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
            placeholder={mode === 'offer' 
              ? 'e.g., Python Programming, Guitar Lessons' 
              : 'e.g., Learn Python, Guitar Basics'}
            required
          />
          {duplicateWarning && (
            <div className="flex items-center gap-2 text-yellow-600 text-sm">
              <AlertCircle className="h-4 w-4" />
              <span>{duplicateWarning}</span>
            </div>
          )}
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">
          {mode === 'offer' 
            ? 'Describe your experience and teaching approach' 
            : 'What aspects would you like to learn? Any specific goals?'}
        </Label>
        <Textarea
          id="description"
          value={formData.description || ''}
          onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
          placeholder={mode === 'offer' 
            ? 'Share your expertise and how you can help others learn'
            : 'Share what you hope to learn and achieve'}
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

      <DialogFooter>
        <Button type="submit">
          {mode === 'offer' ? 'Offer Skill' : 'Request Skill'}
        </Button>
      </DialogFooter>
    </form>
  );
};

export default SkillForm;
