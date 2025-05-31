
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { ChevronDown, ChevronUp } from "lucide-react";

/**
 * VisibilityToggle Component
 * 
 * Collapsible section for configuring which contact information is visible to neighbors.
 * Shows title and description always, but allows collapsing the actual checkbox options to save space.
 * Defaults to email visibility enabled to ensure at least one contact method is visible.
 * Now displays the currently selected option instead of generic "show options" text.
 */
interface VisibilityToggleProps {
  emailVisible: boolean;
  phoneVisible: boolean;
  addressVisible: boolean;
  visibilityError: string;
  showOptions: boolean;
  onEmailVisibleChange: (value: boolean) => void;
  onPhoneVisibleChange: (value: boolean) => void;
  onAddressVisibleChange: (value: boolean) => void;
  onToggleOptions: (show: boolean) => void;
  onVisibilityChange: () => void;
}

export const VisibilityToggle = ({
  emailVisible,
  phoneVisible,
  addressVisible,
  visibilityError,
  showOptions,
  onEmailVisibleChange,
  onPhoneVisibleChange,
  onAddressVisibleChange,
  onToggleOptions,
  onVisibilityChange,
}: VisibilityToggleProps) => {
  // Helper function to get the currently selected default option text
  const getSelectedOptionText = () => {
    if (emailVisible && phoneVisible && addressVisible) {
      return "Show email, phone & address to neighbors";
    } else if (emailVisible && phoneVisible) {
      return "Show email & phone to neighbors";
    } else if (emailVisible && addressVisible) {
      return "Show email & address to neighbors";
    } else if (phoneVisible && addressVisible) {
      return "Show phone & address to neighbors";
    } else if (emailVisible) {
      return "Show email to neighbors";
    } else if (phoneVisible) {
      return "Show phone to neighbors";
    } else if (addressVisible) {
      return "Show address to neighbors (optional)";
    } else {
      return "Select contact visibility options";
    }
  };

  return (
    <div className="space-y-3 p-3 border rounded-lg bg-gray-50">
      {/* Always visible title and description */}
      <div className="space-y-2">
        <Label className="text-sm font-medium">
          Configure Profile Visibility
        </Label>
        <p className="text-xs text-muted-foreground">
          Choose which contact information other neighbors can see. Email or phone must be visible.
        </p>
      </div>

      {/* Collapsible options header - now shows selected option */}
      <div 
        className="flex items-center justify-between cursor-pointer hover:bg-gray-100 rounded p-2 transition-colors"
        onClick={() => onToggleOptions(!showOptions)}
      >
        {/* Display current selection with checkbox styling to match dropdown */}
        <div className="flex items-center space-x-2">
          <Checkbox
            checked={emailVisible || phoneVisible || addressVisible}
            readOnly
            className="pointer-events-none"
          />
          <span className="text-sm font-normal text-gray-700">
            {getSelectedOptionText()}
          </span>
        </div>
        {showOptions ? (
          <ChevronUp className="h-4 w-4 text-gray-500" />
        ) : (
          <ChevronDown className="h-4 w-4 text-gray-500" />
        )}
      </div>

      {/* Collapsible checkbox options */}
      {showOptions && (
        <div className="space-y-2 pt-1">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="show-email"
              checked={emailVisible}
              onCheckedChange={(checked) => {
                onEmailVisibleChange(checked as boolean);
                onVisibilityChange();
              }}
            />
            <Label 
              htmlFor="show-email" 
              className="text-sm font-normal cursor-pointer"
            >
              Show email to neighbors
            </Label>
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="show-phone"
              checked={phoneVisible}
              onCheckedChange={(checked) => {
                onPhoneVisibleChange(checked as boolean);
                onVisibilityChange();
              }}
            />
            <Label 
              htmlFor="show-phone" 
              className="text-sm font-normal cursor-pointer"
            >
              Show phone to neighbors
            </Label>
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="show-address"
              checked={addressVisible}
              onCheckedChange={(checked) => {
                onAddressVisibleChange(checked as boolean);
                onVisibilityChange();
              }}
            />
            <Label 
              htmlFor="show-address" 
              className="text-sm font-normal cursor-pointer"
            >
              Show address to neighbors (optional)
            </Label>
          </div>
        </div>
      )}

      {/* Error message - always visible when there's an error */}
      {visibilityError && (
        <p className="text-xs text-red-500">{visibilityError}</p>
      )}
    </div>
  );
};
