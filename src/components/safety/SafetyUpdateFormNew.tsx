
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useSafetyUpdateSubmit } from "@/hooks/safety/useSafetyUpdateSubmit";

/**
 * Safety update types available in the system
 */
const SAFETY_TYPES = [
  { value: "alert", label: "Alert" },
  { value: "warning", label: "Warning" },
  { value: "information", label: "Information" },
  { value: "community_update", label: "Community Update" },
];

/**
 * Interface for the SafetyUpdateFormNew component props
 */
interface SafetyUpdateFormNewProps {
  onClose: () => void;
  initialValues?: {
    title?: string;
    description?: string;
    type?: string;
  };
  safetyUpdateId?: string;
  mode?: 'create' | 'edit';
}

/**
 * SafetyUpdateFormNew component
 * 
 * A dedicated form for creating safety updates with safety-specific fields
 */
const SafetyUpdateFormNew = ({ 
  onClose,
  initialValues = {},
  safetyUpdateId,
  mode = 'create'
}: SafetyUpdateFormNewProps) => {
  // Form state
  const [title, setTitle] = useState(initialValues.title || "");
  const [description, setDescription] = useState(initialValues.description || "");
  const [type, setType] = useState(initialValues.type || "");
  
  // Get the safety update submission hook
  const { handleSubmit, handleUpdate, isLoading } = useSafetyUpdateSubmit({
    onSuccess: () => {
      onClose();
    }
  });
  
  /**
   * Handle form submission
   */
  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Form data
    const formData = {
      title,
      description,
      type
    };
    
    // Submit or update based on mode
    if (mode === 'edit' && safetyUpdateId) {
      handleUpdate(safetyUpdateId, formData);
    } else {
      handleSubmit(formData);
    }
  };
  
  return (
    <form onSubmit={onSubmit} className="space-y-4">
      {/* Safety Update Type */}
      <div className="space-y-2">
        <Label htmlFor="safetyType">Update Type</Label>
        <Select
          value={type}
          onValueChange={setType}
          required
        >
          <SelectTrigger>
            <SelectValue placeholder="Select update type" />
          </SelectTrigger>
          <SelectContent>
            {SAFETY_TYPES.map(safetyType => (
              <SelectItem key={safetyType.value} value={safetyType.value}>
                {safetyType.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      
      {/* Title */}
      <div className="space-y-2">
        <Label htmlFor="title">Title</Label>
        <Input
          id="title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
          placeholder="Enter a clear, informative title"
        />
      </div>
      
      {/* Description */}
      <div className="space-y-2">
        <Label htmlFor="description">Details</Label>
        <Textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          required
          placeholder="Provide detailed information about this safety update"
          className="min-h-[100px]"
        />
      </div>
      
      {/* Form Buttons */}
      <DialogFooter>
        <Button 
          type="button" 
          variant="outline" 
          onClick={onClose}
          disabled={isLoading}
        >
          Cancel
        </Button>
        <Button 
          type="submit" 
          disabled={isLoading}
        >
          {isLoading 
            ? "Submitting..." 
            : mode === 'edit' 
              ? "Update Safety Information" 
              : "Share Safety Update"}
        </Button>
      </DialogFooter>
    </form>
  );
};

export default SafetyUpdateFormNew;
