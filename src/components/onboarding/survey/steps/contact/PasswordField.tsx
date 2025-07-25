
import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Check, X } from "lucide-react";
import { validatePassword, getStrengthColor, getStrengthLabel } from "@/utils/passwordValidation";
import { PasswordRequirementsOverlay } from "./PasswordRequirementsOverlay";

/**
 * Enhanced PasswordField Component
 * 
 * Renders the password input field with comprehensive validation and visual feedback
 * for account creation. Shows password strength, requirements checklist, and
 * real-time validation to help users create secure passwords that meet Supabase requirements.
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
  // State for showing password requirements
  const [showRequirements, setShowRequirements] = useState(false);
  
  // Get password validation results
  const validation = validatePassword(password);
  
  // Show requirements when user starts typing or clicks on field
  const handleFocus = () => {
    setShowRequirements(true);
  };

  // Hide requirements when field loses focus and password is valid
  const handleBlur = () => {
    onPasswordBlur();
    if (validation.isValid) {
      setShowRequirements(false);
    }
  };

  return (
    <div className="space-y-2">
      <Label htmlFor="password">Password *</Label>
      <div className="space-y-3">
        <Input
          id="password"
          type="password"
          value={password}
          onChange={(e) => onPasswordChange(e.target.value)}
          onFocus={handleFocus}
          onBlur={handleBlur}
          className={passwordError ? "border-red-500" : validation.isValid && password ? "border-green-500" : ""}
          placeholder="Create a strong password (min 8 characters)"
          required
        />
        
        {/* Password strength indicator with dropdown overlay */}
        {password && (
          <div className="space-y-3">
            <Progress 
              value={validation.score} 
              className="h-2"
            />
            <PasswordRequirementsOverlay 
              validation={validation}
              getStrengthColor={getStrengthColor}
              getStrengthLabel={getStrengthLabel}
            />
          </div>
        )}

      </div>
    </div>
  );
};
