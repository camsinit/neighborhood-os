import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface AddressStepProps {
  address: string;
  onAddressChange: (value: string) => void;
}

export const AddressStep = ({ address, onAddressChange }: AddressStepProps) => {
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="address">Address</Label>
        <Input
          id="address"
          value={address}
          onChange={(e) => onAddressChange(e.target.value)}
          required
        />
        <p className="text-sm text-muted-foreground">
          Your address will only be visible to Neighborhood Admins for emergency purposes.
        </p>
      </div>
    </div>
  );
};