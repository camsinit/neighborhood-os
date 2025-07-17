
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

/**
 * ContactFields Component
 * 
 * Renders the email input field with validation.
 * Simplified to only collect email address.
 */
interface ContactFieldsProps {
  email: string;
  emailError: string;
  onEmailChange: (value: string) => void;
  onEmailBlur: () => void;
}

export const ContactFields = ({
  email,
  emailError,
  onEmailChange,
  onEmailBlur,
}: ContactFieldsProps) => {
  return (
    <div className="space-y-2">
      <Label htmlFor="email">Email Address *</Label>
      <Input
        id="email"
        type="email"
        value={email}
        onChange={(e) => onEmailChange(e.target.value)}
        onBlur={onEmailBlur}
        className={emailError ? "border-red-500" : ""}
        required
      />
      {emailError && (
        <p className="text-xs text-red-500">{emailError}</p>
      )}
    </div>
  );
};
