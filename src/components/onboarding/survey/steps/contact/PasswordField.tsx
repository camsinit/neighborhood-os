
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

/**
 * PasswordField Component
 * 
 * Renders the password input field with validation for account creation.
 * Always required since onboarding is for new account creation.
 */
interface PasswordFieldProps {
  password: string;
  passwordError: string;
  onPasswordChange: (value: string) => void;
  onPasswordBlur: () => void;
}

export const PasswordField = ({
  password,
  passwordError,
  onPasswordChange,
  onPasswordBlur,
}: PasswordFieldProps) => {
  return (
    <div className="space-y-2">
      <Label htmlFor="password">Password *</Label>
      <Input
        id="password"
        type="password"
        value={password}
        onChange={(e) => onPasswordChange(e.target.value)}
        onBlur={onPasswordBlur}
        className={passwordError ? "border-red-500" : ""}
        placeholder="Choose a secure password (min 6 characters)"
        required
      />
      {passwordError && (
        <p className="text-sm text-red-500">{passwordError}</p>
      )}
    </div>
  );
};
