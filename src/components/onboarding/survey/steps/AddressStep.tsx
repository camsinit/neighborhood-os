
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

/**
 * Address Step Component
 * 
 * This step collects the user's home address with validation
 * to ensure an address is provided.
 */
interface AddressStepProps {
  address: string;
  onAddressChange: (value: string) => void;
}

export const AddressStep = ({ address, onAddressChange }: AddressStepProps) => {
  // Track validation error
  const [error, setError] = useState("");

  // Validate address
  const validateAddress = (value: string) => {
    if (!value.trim()) {
      setError("Address is required");
      return false;
    }
    setError("");
    return true;
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="address">Home Address</Label>
        <Input
          id="address"
          value={address}
          onChange={(e) => onAddressChange(e.target.value)}
          onBlur={(e) => validateAddress(e.target.value)}
          className={error ? "border-red-500" : ""}
          required
        />
        {error && <p className="text-sm text-red-500">{error}</p>}
        <p className="text-sm text-muted-foreground">
          Your address will only be visible to Neighborhood Admins for emergency purposes.
        </p>
      </div>
    </div>
  );
};
