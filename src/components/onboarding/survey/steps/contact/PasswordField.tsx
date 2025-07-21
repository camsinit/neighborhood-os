
import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Check, X } from "lucide-react";
import { validatePassword, getStrengthColor, getStrengthLabel } from "@/utils/passwordValidation";

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
        
        {/* Password strength indicator */}
        {password && (
          <div className="space-y-1">
            <div className="flex items-center justify-between text-sm">
              <span>Password strength:</span>
              <span className={getStrengthColor(validation.strength)}>
                {getStrengthLabel(validation.strength)}
              </span>
            </div>
            <Progress 
              value={validation.score} 
              className="h-2"
            />
          </div>
        )}

        {/* Requirements checklist */}
        {(showRequirements || !validation.isValid) && password && (
          <div className="bg-gray-50 rounded-lg p-3 space-y-2">
            <p className="text-sm font-medium text-gray-700">Password requirements:</p>
            <div className="grid grid-cols-2 gap-y-1 gap-x-3">
              {validation.requirements.map((requirement) => (
                <div key={requirement.id} className="flex items-center space-x-2 text-sm">
                  {requirement.met ? (
                    <Check className="h-4 w-4 text-green-500" />
                  ) : (
                    <X className="h-4 w-4 text-red-500" />
                  )}
                  <span className={requirement.met ? "text-green-700" : "text-red-600"}>
                    {requirement.label}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Error message */}
        {passwordError && (
          <p className="text-sm text-red-500">{passwordError}</p>
        )}
        
        {/* Success message */}
        {validation.isValid && password && !passwordError && (
          <p className="text-sm text-green-600 flex items-center space-x-1">
            <Check className="h-4 w-4" />
            <span>Password meets all security requirements</span>
          </p>
        )}
      </div>
    </div>
  );
};
