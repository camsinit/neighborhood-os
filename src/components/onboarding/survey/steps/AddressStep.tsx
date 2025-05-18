
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";

interface AddressStepProps {
  address: string;
  onAddressChange: (value: string) => void;
}

export const AddressStep = ({ address, onAddressChange }: AddressStepProps) => {
  // Track if field has been touched for validation
  const [touched, setTouched] = useState(false);
  
  // Simple validation - just check if address is provided
  const addressError = touched && !address.trim() ? "Address is required" : "";

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="address" className={addressError ? "text-red-500" : ""}>
          Home Address*
        </Label>
        <Input
          id="address"
          value={address}
          onChange={(e) => onAddressChange(e.target.value)}
          onBlur={() => setTouched(true)}
          className={addressError ? "border-red-500" : ""}
          placeholder="123 Main St, City, State, ZIP"
          required
        />
        {addressError && <p className="text-sm text-red-500">{addressError}</p>}
        <p className="text-sm text-muted-foreground">
          Your address will only be visible to Neighborhood Admins for emergency purposes.
          You can control your address visibility in settings later.
        </p>
      </div>
    </div>
  );
};
