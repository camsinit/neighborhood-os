import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Info } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

/**
 * Address Step Component
 * 
 * This step collects the user's home address with validation
 * to ensure an address is provided.
 * UPDATED: Only shows validation errors after field is touched
 */
interface AddressStepProps {
  address: string;
  onAddressChange: (value: string) => void;
  onValidation?: (field: string, isValid: boolean) => void; // Add validation callback
}
export const AddressStep = ({
  address,
  onAddressChange,
  onValidation
}: AddressStepProps) => {
  // Track validation error
  const [error, setError] = useState("");

  // Track if field has been touched by the user to prevent immediate error display
  const [touched, setTouched] = useState(false);

  // Validate address and notify parent
  const validateAddress = (value: string) => {
    const isValid = value.trim().length > 0;
    if (!isValid && touched) {
      setError("Address is required");
    } else {
      setError("");
    }

    // Notify parent component of validation result
    onValidation?.("address", isValid);
    return isValid;
  };

  // Handle field blur to mark as touched and validate
  const handleAddressBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    setTouched(true);
    validateAddress(e.target.value);
  };

  // Run validation when value changes (but only show errors if touched)
  useEffect(() => {
    validateAddress(address);
  }, [address, touched]);
  return (
    <TooltipProvider>
      <div className="space-y-4">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Label htmlFor="address">Home Address *</Label>
            <Tooltip>
              <TooltipTrigger asChild>
                <Info className="h-4 w-4 text-muted-foreground cursor-help hover:text-foreground transition-colors" />
              </TooltipTrigger>
              <TooltipContent side="right" className="max-w-xs">
                <p className="text-sm">
                  Only neighborhood admins have access to your address and it won't be shared publicly.
                </p>
              </TooltipContent>
            </Tooltip>
          </div>
          <Input id="address" value={address} onChange={e => onAddressChange(e.target.value)} onBlur={handleAddressBlur} className={error ? "border-red-500" : ""} required />
          {error && <p className="text-sm text-red-500">{error}</p>}
        </div>
      </div>
    </TooltipProvider>
  );
};