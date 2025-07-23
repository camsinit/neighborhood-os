import { useState } from "react";
import { ChevronDown, ChevronUp, Check, X } from "lucide-react";
import { PasswordValidationResult } from "@/utils/passwordValidation";

/**
 * PasswordRequirementsOverlay Component
 * 
 * A collapsible overlay that displays password validation requirements
 * without taking up permanent space in the UI. Similar to the SelectedSkillsOverlay,
 * this component floats over other content when expanded.
 */
interface PasswordRequirementsOverlayProps {
  validation: PasswordValidationResult;
  getStrengthColor: (strength: PasswordValidationResult['strength']) => string;
  getStrengthLabel: (strength: PasswordValidationResult['strength']) => string;
}

export const PasswordRequirementsOverlay = ({
  validation,
  getStrengthColor,
  getStrengthLabel,
}: PasswordRequirementsOverlayProps) => {
  // State to control whether the overlay is expanded or collapsed
  const [isExpanded, setIsExpanded] = useState(false);

  // Don't render anything if password is empty
  if (!validation) return null;

  return (
    <div className="relative">
      {/* Header bar that's always visible - shows password strength and toggle */}
      <div 
        className="flex items-center justify-between p-2 bg-gray-50 rounded cursor-pointer hover:bg-gray-100 transition-colors"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center space-x-2">
          <span className="text-sm text-gray-600">Password strength:</span>
          <span className={`text-sm font-medium ${getStrengthColor(validation.strength)}`}>
            {getStrengthLabel(validation.strength)}
          </span>
        </div>
        
        {/* Chevron icon indicating expand/collapse state */}
        {isExpanded ? (
          <ChevronUp className="h-4 w-4 text-gray-500" />
        ) : (
          <ChevronDown className="h-4 w-4 text-gray-500" />
        )}
      </div>

      {/* Expanded overlay content - positioned absolutely to avoid pushing content down */}
      {isExpanded && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50 p-3">
          <p className="text-sm font-medium text-gray-700 mb-2">Password requirements:</p>
          <div className="space-y-1">
            {validation.requirements.map((requirement) => (
              <div key={requirement.id} className="flex items-center space-x-2 text-xs">
                {/* Check or X icon based on whether requirement is met */}
                {requirement.met ? (
                  <Check className="h-3 w-3 text-green-500 flex-shrink-0" />
                ) : (
                  <X className="h-3 w-3 text-red-500 flex-shrink-0" />
                )}
                {/* Requirement text with color based on completion status */}
                <span className={`whitespace-nowrap ${requirement.met ? "text-green-700" : "text-red-600"}`}>
                  {requirement.label}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};