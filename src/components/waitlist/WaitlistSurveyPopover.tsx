import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { X, ChevronLeft, ChevronRight } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";

/**
 * Survey form data interface
 */
interface SurveyData {
  email: string;
  firstName: string;
  lastName: string;
  neighborhoodName: string;
  city: string;
  state: string;
  neighborsToOnboard: number;
  aiCodingExperience: string;
  openSourceInterest: string;
}

/**
 * Props for the WaitlistSurveyPopover component
 */
interface WaitlistSurveyPopoverProps {
  isOpen: boolean;
  onClose: () => void;
  userEmail: string; // Pre-populated from the waitlist form
}

/**
 * WaitlistSurveyPopover Component
 * 
 * A dialog that appears after someone joins the waitlist to collect
 * additional information for prioritizing onboarding. Uses a carousel
 * to navigate between essential info and additional questions.
 */
const WaitlistSurveyPopover = ({
  isOpen,
  onClose,
  userEmail
}: WaitlistSurveyPopoverProps) => {
  // Current carousel page (0 = essential info, 1 = additional questions)
  const [currentPage, setCurrentPage] = useState(0);

  // Loading state for form submission
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Toast for user feedback
  const {
    toast
  } = useToast();

  // Form data state with pre-populated email
  const [formData, setFormData] = useState<SurveyData>({
    email: userEmail,
    firstName: "",
    lastName: "",
    neighborhoodName: "",
    city: "",
    state: "",
    neighborsToOnboard: 1,
    // Default to 1 instead of 0
    aiCodingExperience: "",
    openSourceInterest: ""
  });

  /**
   * Handle input field changes
   */
  const handleInputChange = (field: keyof SurveyData, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  /**
   * Navigate to the next carousel page
   */
  const handleNext = () => {
    if (currentPage < 1) {
      setCurrentPage(currentPage + 1);
    }
  };

  /**
   * Navigate to the previous carousel page
   */
  const handlePrevious = () => {
    if (currentPage > 0) {
      setCurrentPage(currentPage - 1);
    }
  };

  /**
   * Submit the survey data
   */
  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      console.log("Submitting waitlist survey:", formData);

      // Call edge function to save survey data
      const {
        data,
        error
      } = await supabase.functions.invoke("save-waitlist-survey", {
        body: formData
      });
      if (error) {
        console.error("Error submitting survey:", error);
        throw new Error("Failed to submit survey");
      }
      console.log("Survey submitted successfully:", data);
      toast({
        title: "Thank you!",
        description: "Your information has been submitted. We'll be in touch soon!"
      });

      // Close the popover
      onClose();
    } catch (error: any) {
      console.error("Survey submission error:", error);
      toast({
        title: "Something went wrong",
        description: error.message || "Failed to submit survey. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  /**
   * Check if current page can be completed
   */
  const canProceed = () => {
    if (currentPage === 0) {
      // Essential info page - require all fields
      return formData.firstName && formData.lastName && formData.neighborhoodName && formData.city && formData.state;
    } else {
      // Additional questions page - require all fields
      return formData.neighborsToOnboard > 0 && formData.aiCodingExperience && formData.openSourceInterest;
    }
  };

  /**
   * Render the essential info page (page 0)
   */
   const renderEssentialInfoPage = () => <div className="space-y-4">

      {/* Email field - pre-populated and disabled */}
      <div>
        <Label htmlFor="email">Email Address</Label>
        <Input id="email" type="email" value={formData.email} disabled className="bg-gray-100" />
      </div>

      {/* Name fields */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="firstName">First Name</Label>
          <Input id="firstName" value={formData.firstName} onChange={e => handleInputChange('firstName', e.target.value)} placeholder="Enter your first name" />
        </div>
        <div>
          <Label htmlFor="lastName">Last Name</Label>
          <Input id="lastName" value={formData.lastName} onChange={e => handleInputChange('lastName', e.target.value)} placeholder="Enter your last name" />
        </div>
      </div>

      {/* Neighborhood name */}
      <div>
        <Label htmlFor="neighborhoodName">Neighborhood Name</Label>
        <Input id="neighborhoodName" value={formData.neighborhoodName} onChange={e => handleInputChange('neighborhoodName', e.target.value)} placeholder="e.g., Sunset District, Capitol Hill" />
      </div>

      {/* City and State */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="city">City</Label>
          <Input id="city" value={formData.city} onChange={e => handleInputChange('city', e.target.value)} placeholder="Enter your city" />
        </div>
        <div>
          <Label htmlFor="state">State</Label>
          <Input id="state" value={formData.state} onChange={e => handleInputChange('state', e.target.value)} placeholder="e.g., CA, NY" />
        </div>
      </div>
    </div>;

  /**
   * Render the additional questions page (page 1)
   */
  const renderAdditionalQuestionsPage = () => <div className="space-y-6">
      <div className="text-center mb-6">
        <h3 className="text-lg font-semibold mb-2">Additional Questions</h3>
        <p className="text-gray-600">Help us prioritize onboarding and provide better support</p>
      </div>

      {/* Number of neighbors */}
      <div>
        <Label htmlFor="neighborsCount">How many neighbors would you feel comfortable onboarding onto neighborhoodOS?</Label>
        <Input id="neighborsCount" type="number" min="0" max="100" value={formData.neighborsToOnboard} onChange={e => handleInputChange('neighborsToOnboard', parseInt(e.target.value) || 1)} placeholder="Enter a number" className="mt-2" />
      </div>

      {/* AI Coding Experience */}
      <div>
        <Label htmlFor="aiExperience">Do you have any experience with AI coding?</Label>
        <Select value={formData.aiCodingExperience} onValueChange={value => handleInputChange('aiCodingExperience', value)}>
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
      <div>
        <Label htmlFor="openSourceInterest">Are you interested in open-source software?</Label>
        <Select value={formData.openSourceInterest} onValueChange={value => handleInputChange('openSourceInterest', value)}>
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
    </div>;
  return <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <Button variant="ghost" size="sm" onClick={onClose} className="h-6 w-6 p-0">
              <X className="h-4 w-4" />
            </Button>
            <h3 className="text-lg font-semibold absolute left-1/2 transform -translate-x-1/2">Neighborhood Information</h3>
            <div></div>
          </DialogTitle>
        </DialogHeader>

        {/* Progress indicator */}
        <div className="flex justify-center space-x-2 mb-4">
          <div className={cn("h-2 w-2 rounded-full", currentPage === 0 ? "bg-blue-600" : "bg-gray-300")} />
          <div className={cn("h-2 w-2 rounded-full", currentPage === 1 ? "bg-blue-600" : "bg-gray-300")} />
        </div>

        {/* Carousel content */}
        <div className="min-h-[400px]">
          {currentPage === 0 ? renderEssentialInfoPage() : renderAdditionalQuestionsPage()}
        </div>

        {/* Navigation buttons */}
        <div className="flex justify-between pt-4">
          <Button variant="outline" onClick={handlePrevious} disabled={currentPage === 0} className="flex items-center gap-2">
            <ChevronLeft className="h-4 w-4" />
            Previous
          </Button>

          {currentPage < 1 ? <Button onClick={handleNext} disabled={!canProceed()} className="flex items-center gap-2">
              Next
              <ChevronRight className="h-4 w-4" />
            </Button> : <Button onClick={handleSubmit} disabled={!canProceed() || isSubmitting} className="flex items-center gap-2">
              {isSubmitting ? "Submitting..." : "Submit"}
            </Button>}
        </div>
      </DialogContent>
    </Dialog>;
};
export default WaitlistSurveyPopover;