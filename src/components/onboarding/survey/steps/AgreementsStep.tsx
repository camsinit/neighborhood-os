import { useState } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";

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
    <div className="space-y-6">
      {/* Header explaining the agreements */}
      <div className="text-center space-y-2">
        <h3 className="text-lg font-semibold text-foreground">
          Neighborhood Agreements
        </h3>
        <p className="text-sm text-muted-foreground">
          To create a welcoming community, we ask everyone to agree to these basic principles:
        </p>
      </div>

      {/* List of agreements with checkboxes */}
      <div className="space-y-4">
        {NEIGHBORHOOD_AGREEMENTS.map((agreement) => (
          <div key={agreement.id} className="space-y-2">
            {/* Checkbox and main agreement text */}
            <div className="flex items-start space-x-3">
              <Checkbox
                id={agreement.id}
                checked={agreementState[agreement.id]}
                onCheckedChange={(checked) => 
                  handleAgreementToggle(agreement.id, checked === true)
                }
                className="mt-1"
              />
              <div className="space-y-1 flex-1">
                <Label
                  htmlFor={agreement.id}
                  className="text-sm font-medium leading-none cursor-pointer"
                >
                  {agreement.title}
                </Label>
                {/* Sub-text explaining the agreement */}
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {agreement.description}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Footer note about community standards */}
      <div className="text-xs text-muted-foreground text-center pt-2 border-t">
        By checking these boxes, you're helping us build a neighborhood where everyone feels welcome and supported.
      </div>
    </div>
  );
};

/**
 * Export the AgreementState type for use in parent components
 */
export type { AgreementState };