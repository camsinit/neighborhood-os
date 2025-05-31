
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { ChevronDown, ChevronUp } from "lucide-react";

/**
 * VisibilityToggle Component
 * 
 * Collapsible section for configuring which contact information is visible to neighbors.
 * Uses a clickable header to show/hide the visibility options with validation.
 * The options are always required - this just collapses them to save space.
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
      <div 
        className="flex items-center justify-between cursor-pointer hover:bg-gray-100 rounded p-2 transition-colors"
        onClick={() => onToggleOptions(!showOptions)}
      >
        <Label className="text-sm font-medium cursor-pointer">
          Configure Profile Visibility
        </Label>
        {showOptions ? (
          <ChevronUp className="h-4 w-4 text-gray-500" />
        ) : (
          <ChevronDown className="h-4 w-4 text-gray-500" />
        )}
      </div>

      {showOptions && (
        <div className="space-y-3 pt-2">
          <p className="text-xs text-muted-foreground">
            Choose which contact information other neighbors can see. At least one must be visible.
          </p>

          <div className="space-y-2">
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

          {visibilityError && (
            <p className="text-xs text-red-500">{visibilityError}</p>
          )}
        </div>
      )}
    </div>
  );
};
