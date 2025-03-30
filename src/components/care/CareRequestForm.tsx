
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useUser } from "@supabase/auth-helpers-react";
import { useQueryClient } from "@tanstack/react-query";
import { useCurrentNeighborhood } from "@/hooks/useCurrentNeighborhood";

/**
 * Care request types available in the system
 */
const CARE_CATEGORIES = [
  { value: "meals", label: "Meals & Food" },
  { value: "transportation", label: "Transportation" },
  { value: "childcare", label: "Childcare" },
  { value: "eldercare", label: "Eldercare" },
  { value: "emotional_support", label: "Emotional Support" },
  { value: "errands", label: "Errands & Shopping" },
  { value: "pet_care", label: "Pet Care" },
  { value: "housework", label: "Housework" },
  { value: "other", label: "Other" }
];

/**
 * Interface for the CareRequestForm component props
 */
interface CareRequestFormProps {
  onClose: () => void;
  initialValues?: {
    title?: string;
    description?: string;
    careCategory?: string;
    requestType?: "need" | "offer"; 
    validUntil?: string;
  };
}

/**
 * CareRequestForm component
 * 
 * A dedicated form for creating care requests with care-specific fields
 */
const CareRequestForm = ({ 
  onClose,
  initialValues = {}
}: CareRequestFormProps) => {
  // Form state
  const [title, setTitle] = useState(initialValues.title || "");
  const [description, setDescription] = useState(initialValues.description || "");
  const [careCategory, setCareCategory] = useState(initialValues.careCategory || "");
  const [requestType, setRequestType] = useState<"need" | "offer">(initialValues.requestType || "need");
  const [validUntil, setValidUntil] = useState(initialValues.validUntil || "");
  
  // Get the current authenticated user
  const user = useUser();
  
  // Get the query client for cache invalidation
  const queryClient = useQueryClient();
  
  // Get the current neighborhood ID
  const neighborhoodId = useCurrentNeighborhood();
  
  // Loading state
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  /**
   * Handle form submission
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast.error("You must be logged in to submit a care request");
      return;
    }
    
    if (!neighborhoodId) {
      toast.error("You must be in a neighborhood to submit a care request");
      return;
    }
    
    // Calculate expiry date (default to 30 days if not provided)
    const expiryDate = validUntil 
      ? new Date(validUntil).toISOString() 
      : new Date(new Date().setDate(new Date().getDate() + 30)).toISOString();
    
    setIsSubmitting(true);
    
    try {
      // Create the care request
      const { data, error } = await supabase
        .from('care_requests')
        .insert({
          title,
          description,
          care_category: careCategory,
          request_type: requestType,
          user_id: user.id,
          valid_until: expiryDate,
          neighborhood_id: neighborhoodId,
          support_type: "care" // Marking this as a care request
        })
        .select();
      
      if (error) {
        console.error("Error creating care request:", error);
        throw error;
      }
      
      // Success!
      toast.success(`Your care ${requestType} has been posted!`);
      
      // Invalidate queries to refresh data
      queryClient.invalidateQueries({ queryKey: ['care_requests'] });
      
      // Close the dialog
      onClose();
      
      console.log("Care request created:", data);
      
    } catch (error) {
      console.error("Failed to create care request:", error);
      toast.error("Failed to create care request. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Request Type Selection */}
      <div className="space-y-2">
        <Label>I want to:</Label>
        <div className="flex space-x-2">
          <Button
            type="button"
            variant={requestType === "need" ? "default" : "outline"}
            onClick={() => setRequestType("need")}
            className="flex-1"
          >
            Request Help
          </Button>
          <Button
            type="button"
            variant={requestType === "offer" ? "default" : "outline"}
            onClick={() => setRequestType("offer")}
            className="flex-1"
          >
            Offer Help
          </Button>
        </div>
      </div>
      
      {/* Care Category */}
      <div className="space-y-2">
        <Label htmlFor="careCategory">Type of Care</Label>
        <Select
          value={careCategory}
          onValueChange={setCareCategory}
          required
        >
          <SelectTrigger>
            <SelectValue placeholder="Select care type" />
          </SelectTrigger>
          <SelectContent>
            {CARE_CATEGORIES.map(category => (
              <SelectItem key={category.value} value={category.value}>
                {category.label}
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
          placeholder={requestType === "need" ? "What do you need help with?" : "What help can you offer?"}
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
          placeholder="Provide important details about your request or offer"
          className="min-h-[100px]"
        />
      </div>
      
      {/* Valid Until */}
      <div className="space-y-2">
        <Label htmlFor="validUntil">Valid Until</Label>
        <Input
          id="validUntil"
          type="date"
          value={validUntil}
          onChange={(e) => setValidUntil(e.target.value)}
          min={new Date().toISOString().split('T')[0]} // Can't select dates in the past
        />
        <p className="text-xs text-gray-500">If not specified, this request will expire after 30 days.</p>
      </div>
      
      {/* Form Buttons */}
      <DialogFooter>
        <Button 
          type="button" 
          variant="outline" 
          onClick={onClose}
          disabled={isSubmitting}
        >
          Cancel
        </Button>
        <Button 
          type="submit" 
          disabled={isSubmitting}
        >
          {isSubmitting ? "Submitting..." : requestType === "need" ? "Request Help" : "Offer Help"}
        </Button>
      </DialogFooter>
    </form>
  );
};

export default CareRequestForm;
