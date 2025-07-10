import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";

/**
 * VisibilityToggle Component
 * 
 * Simple checkbox section for configuring which contact information is visible to neighbors.
 * Shows all options directly without any collapsing behavior for better usability.
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
  onEmailVisibleChange,
  onPhoneVisibleChange,
  onAddressVisibleChange,
  onVisibilityChange
}: VisibilityToggleProps) => {
  return (
    <div className="space-y-3 p-3 border rounded-lg bg-gray-50">
      {/* Title and description */}
      <div className="space-y-2">
        <Label className="text-sm font-medium">Preferred Communication</Label>
        <p className="text-xs text-muted-foreground">Choose how you want neighbors to contact you.</p>
      </div>

      {/* Always visible checkbox options */}
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
          <Label htmlFor="show-email" className="text-sm font-normal cursor-pointer">
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
          <Label htmlFor="show-phone" className="text-sm font-normal cursor-pointer">
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
          <Label htmlFor="show-address" className="text-sm font-normal cursor-pointer">
            Show address to neighbors (optional)
          </Label>
        </div>
      </div>

      {/* Error message - always visible when there's an error */}
      {visibilityError && <p className="text-xs text-red-500">{visibilityError}</p>}
    </div>
  );
};