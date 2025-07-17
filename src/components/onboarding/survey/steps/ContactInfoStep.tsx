import { useState, useEffect } from "react";
import { ContactFields } from "./contact/ContactFields";
import { PasswordField } from "./contact/PasswordField";
import { validatePassword as validatePasswordStrength } from "@/utils/passwordValidation";

/**
 * Contact Information Step Component
 * 
 * This step collects the user's email and password with validation.
 * Simplified to remove phone number collection and contact preferences.
 * 
 * REFACTORED: Broken into smaller focused components for better maintainability
 * UPDATED: Simplified to only collect email and password
 * UPDATED: Only shows validation errors after fields are touched
 */
interface ContactInfoStepProps {
  email: string;
  password: string;
  onEmailChange: (value: string) => void;
  onPasswordChange: (value: string) => void;
  onValidation?: (field: string, isValid: boolean) => void;
  isOAuthUser?: boolean;
}

export const ContactInfoStep = ({
  email,
  password,
  onEmailChange,
  onPasswordChange,
  onValidation,
  isOAuthUser = false,
}: ContactInfoStepProps) => {
  // Track validation errors
  const [errors, setErrors] = useState({
    email: "",
    password: "",
  });

  // Track if fields have been touched by the user to prevent immediate error display
  const [touched, setTouched] = useState({
    email: false,
    password: false,
  });

  // Validate email format using regex and notify parent
  const validateEmail = (value: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    let isValid = true;
    
    if (!value.trim()) {
      if (touched.email) {
        setErrors(prev => ({ ...prev, email: "Email is required" }));
      }
      isValid = false;
    } else if (!emailRegex.test(value)) {
      if (touched.email) {
        setErrors(prev => ({ ...prev, email: "Please enter a valid email address" }));
      }
      isValid = false;
    } else {
      setErrors(prev => ({ ...prev, email: "" }));
    }
    
    // Notify parent component of validation result
    onValidation?.("email", isValid);
    return isValid;
  };

  // Validate password using enhanced validation utility
  const validatePassword = (value: string) => {
    if (!value.trim()) {
      if (touched.password) {
        setErrors(prev => ({ ...prev, password: "Password is required" }));
      }
      onValidation?.("password", false);
      return false;
    }
    
    // Use the comprehensive password validation
    const validation = validatePasswordStrength(value);
    
    if (!validation.isValid && touched.password) {
      setErrors(prev => ({ ...prev, password: validation.message }));
    } else {
      setErrors(prev => ({ ...prev, password: "" }));
    }
    
    // Notify parent component of validation result
    onValidation?.("password", validation.isValid);
    return validation.isValid;
  };

  // Handle field blur to mark as touched and validate
  const handleEmailBlur = () => {
    setTouched(prev => ({ ...prev, email: true }));
    validateEmail(email);
  };

  const handlePasswordBlur = () => {
    setTouched(prev => ({ ...prev, password: true }));
    validatePassword(password);
  };

  // Run validation when values change (but only show errors if touched)
  useEffect(() => {
    validateEmail(email);
  }, [email, touched.email]);

  useEffect(() => {
    validatePassword(password);
  }, [password, touched.password]);

  return (
    <div className="space-y-4">
      {/* Email field */}
      <ContactFields
        email={email}
        emailError={errors.email}
        onEmailChange={onEmailChange}
        onEmailBlur={handleEmailBlur}
      />

      {/* Password field - only shown for manual users */}
      {!isOAuthUser && (
        <PasswordField
          password={password}
          passwordError={errors.password}
          onPasswordChange={onPasswordChange}
          onPasswordBlur={handlePasswordBlur}
        />
      )}
    </div>
  );
};