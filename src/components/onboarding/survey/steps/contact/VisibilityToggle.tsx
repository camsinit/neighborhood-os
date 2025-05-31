
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { ChevronDown, ChevronUp } from "lucide-react";

/**
 * VisibilityToggle Component
 * 
 * Collapsible section for configuring which contact information is visible to neighbors.
 * Shows title and description always, but allows collapsing the actual checkbox options to save space.
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
  return (
    <div className="space-y-3 p-3 border rounded-lg bg-gray-50">
      {/* Always visible title and description */}
      <div className="space-y-2">
        <Label className="text-sm font-medium">
          Configure Profile Visibility
        </Label>
        <p className="text-xs text-muted-foreground">
          Choose which contact information other neighbors can see. At least one must be visible.
        </p>
      </div>

      {/* Collapsible options header */}
      <div 
        className="flex items-center justify-between cursor-pointer hover:bg-gray-100 rounded p-2 transition-colors"
        onClick={() => onToggleOptions(!showOptions)}
      >
        <span className="text-sm text-gray-700">
          {showOptions ? "Hide options" : "Show options"}
        </span>
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
              Show address to neighbors
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
