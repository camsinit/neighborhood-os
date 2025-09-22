import { useState } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Info } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

/**
 * Interface for tracking which agreements have been accepted
 */
interface AgreementState {
  communication: boolean;
  authenticity: boolean;
  followThrough: boolean;
  respectfulness: boolean;
}

/**
 * Props for the AgreementsStep component
 */
interface AgreementsStepProps {
  /**
   * Current state of agreement checkboxes
   */
  agreementState: AgreementState;
  /**
   * Handler for when agreement checkbox values change
   */
  onAgreementChange: (agreements: AgreementState) => void;
  /**
   * Validation callback to inform parent of step validity
   */
  onValidation: (field: string, isValid: boolean) => void;
}

/**
 * The neighborhood agreements that users must accept during onboarding.
 * These establish the community standards and expected behavior.
 */
const NEIGHBORHOOD_AGREEMENTS = [
  {
    id: 'communication' as keyof AgreementState,
    title: 'Be respectful and intentional with your communication',
    description: 'This isn\'t Nextdoor or Facebook, we don\'t need more spam or trolls.'
  },
  {
    id: 'authenticity' as keyof AgreementState,
    title: 'Show up as your real self',
    description: 'Use your real name and photo. You\'re going to see these people on neighborhood walks anyway.'
  },
  {
    id: 'followThrough' as keyof AgreementState,
    title: 'Follow through on your commitments',
    description: 'If you say you\'ll help with a Guitar lesson or borrow the hedge trimmer, actually do it.'
  },
  {
    id: 'respectfulness' as keyof AgreementState,
    title: 'Don\'t be a jerk',
    description: 'Everyone deserves to feel welcome here, regardless of how they look, who they love, or where they come from. neighborhoodOS will not tolerate any form of hate speech or bullying.'
  }
];

/**
 * AgreementsStep component for the onboarding survey
 * 
 * This step presents the neighborhood agreements that users must accept
 * before joining the community. All agreements must be checked to proceed.
 */
export const AgreementsStep = ({ 
  agreementState, 
  onAgreementChange, 
  onValidation 
}: AgreementsStepProps) => {
  
  /**
   * Handle checkbox change for individual agreements
   */
  const handleAgreementToggle = (agreementId: keyof AgreementState, checked: boolean) => {
    // Update the agreement state with the new checkbox value
    const newState = {
      ...agreementState,
      [agreementId]: checked
    };
    
    // Notify parent component of the change
    onAgreementChange(newState);
    
    // Check if all agreements are now accepted for validation
    const allAccepted = Object.values(newState).every(value => value === true);
    onValidation('agreements', allAccepted);
  };

  return (
    // Outer wrapper for the step content. We keep spacing a bit tighter (compressed)
    // so the list reads quickly on smaller screens like iPads.
    <div className="space-y-4">
      {/* Short instructional helper text so it's obvious what to do */}
      <p className="text-base text-blue-600 text-center pt-2 pb-4">
        Check all the boxes to continue. These agreements help keep neighborhoodOS a place we all want to be.
      </p>

      {/* List of agreements with checkboxes */}
      <TooltipProvider delayDuration={300}>
        <div className="space-y-4">
          {NEIGHBORHOOD_AGREEMENTS.map((agreement) => (
            <div key={agreement.id} className="space-y-1">
              {/* Checkbox and main agreement text */}
              <div className="flex items-center gap-3">
                <Checkbox
                  id={agreement.id}
                  checked={agreementState[agreement.id]}
                  onCheckedChange={(checked) =>
                    handleAgreementToggle(agreement.id, checked === true)
                  }
                  // Make the boxes visually clearer with rounded edges and proper alignment
                  className="h-5 w-5 rounded border-2 border-primary"
                />
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <Label
                      htmlFor={agreement.id}
                      className="text-sm font-medium leading-snug cursor-pointer flex-1"
                    >
                      {agreement.title}
                    </Label>
                    <Tooltip delayDuration={300}>
                      <TooltipTrigger asChild>
                        <button type="button" className="inline-flex items-center justify-center">
                          <Info className="h-4 w-4 text-gray-400 hover:text-gray-600 cursor-help" />
                        </button>
                      </TooltipTrigger>
                      <TooltipContent side="top" className="max-w-xs z-50">
                        <p className="text-sm">{agreement.description}</p>
                      </TooltipContent>
                    </Tooltip>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </TooltipProvider>
    </div>
  );
};

/**
 * Export the AgreementState type for use in parent components
 */
export type { AgreementState };