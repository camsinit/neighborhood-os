import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Check, X, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { validatePassword, getStrengthColor, getStrengthLabel } from "@/utils/passwordValidation";
import { PasswordRequirementsOverlay } from "@/components/onboarding/survey/steps/contact/PasswordRequirementsOverlay";

/**
 * Enhanced Password Input Component for Authentication
 * 
 * Provides password input with optional strength validation and requirements display.
 * Can be used for both sign-in (simple mode) and sign-up (with validation) scenarios.
 */
interface PasswordInputProps {
  value: string;
  onChange: (value: string) => void;
  onBlur?: () => void;
  placeholder?: string;
  disabled?: boolean;
  showValidation?: boolean; // Whether to show strength meter and requirements
  error?: string;
  className?: string;
}

export const PasswordInput = ({
  value,
  onChange,
  onBlur,
  placeholder = "Password",
  disabled = false,
  showValidation = false,
  error,
  className,
}: PasswordInputProps) => {
  // State for password visibility toggle
  const [showPassword, setShowPassword] = useState(false);
  
  // State for showing requirements (only when validation is enabled)
  const [showRequirements, setShowRequirements] = useState(false);
  
  // Get password validation results (only when validation is enabled)
  const validation = showValidation ? validatePassword(value) : null;

  // Handle focus - show requirements if validation is enabled
  const handleFocus = () => {
    if (showValidation && value) {
      setShowRequirements(true);
    }
  };

  // Handle blur - hide requirements if password is valid
  const handleBlur = () => {
    onBlur?.();
    if (showValidation && validation?.isValid) {
      setShowRequirements(false);
    }
  };

  return (
    <div className="space-y-2">
      {/* Password input with visibility toggle */}
      <div className="relative">
        <Input
          type={showPassword ? "text" : "password"}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onFocus={handleFocus}
          onBlur={handleBlur}
          placeholder={placeholder}
          disabled={disabled}
          className={`pr-10 ${error ? "border-red-500" : ""} ${
            validation?.isValid && value ? "border-green-500" : ""
          } ${className || ""}`}
        />
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
          onClick={() => setShowPassword(!showPassword)}
          disabled={disabled}
        >
          {showPassword ? (
            <EyeOff className="h-4 w-4 text-gray-500" />
          ) : (
            <Eye className="h-4 w-4 text-gray-500" />
          )}
        </Button>
      </div>

      {/* Password strength indicator with dropdown overlay */}
      {showValidation && validation && value && (
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

      {/* Error message */}
      {error && (
        <p className="text-sm text-red-500">{error}</p>
      )}
      
      {/* Success message (only when validation is enabled) */}
      {showValidation && validation?.isValid && value && !error && (
        <p className="text-sm text-green-600 flex items-center space-x-1">
          <Check className="h-4 w-4" />
          <span>Password meets all security requirements</span>
        </p>
      )}
    </div>
  );
};