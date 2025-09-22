import { useState, useEffect } from "react";
import { ContactFields } from "./contact/ContactFields";
import { PasswordField } from "./contact/PasswordField";
import { validatePassword as validatePasswordStrength } from "@/utils/passwordValidation";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";

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
  contactPreference: string;
  customContactMethod?: string;
  onEmailChange: (value: string) => void;
  onPasswordChange: (value: string) => void;
  onContactPreferenceChange: (value: string) => void;
  onCustomContactMethodChange: (value: string) => void;
  onValidation?: (field: string, isValid: boolean) => void;
  isOAuthUser?: boolean;
}

const CONTACT_OPTIONS = [
  { value: "whatsapp", label: "WhatsApp" },
  { value: "texting", label: "Texting" },
  { value: "email", label: "Email" },
  { value: "facebook_messenger", label: "Facebook Messenger" },
  { value: "knocking", label: "Knock on My Door" },
  { value: "other", label: "Other" },
];

export const ContactInfoStep = ({
  email,
  password,
  contactPreference,
  customContactMethod = "",
  onEmailChange,
  onPasswordChange,
  onContactPreferenceChange,
  onCustomContactMethodChange,
  onValidation,
  isOAuthUser = false,
}: ContactInfoStepProps) => {
  // Track validation errors
  const [errors, setErrors] = useState({
    email: "",
    password: "",
    contactPreference: "",
    customContactMethod: "",
  });

  // Track if fields have been touched by the user to prevent immediate error display
  const [touched, setTouched] = useState({
    email: false,
    password: false,
    contactPreference: false,
    customContactMethod: false,
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

  // Validate contact preference selection
  const validateContactPreference = (value: string) => {
    let isValid = true;
    
    if (!value) {
      if (touched.contactPreference) {
        setErrors(prev => ({ ...prev, contactPreference: "Please select a contact method" }));
      }
      isValid = false;
    } else {
      setErrors(prev => ({ ...prev, contactPreference: "" }));
    }
    
    onValidation?.("contactPreference", isValid);
    return isValid;
  };

  // Validate custom contact method (only if "Other" is selected)
  const validateCustomContactMethod = (value: string) => {
    let isValid = true;
    
    if (contactPreference === "other") {
      if (!value.trim()) {
        if (touched.customContactMethod) {
          setErrors(prev => ({ ...prev, customContactMethod: "Please specify your contact method" }));
        }
        isValid = false;
      } else {
        setErrors(prev => ({ ...prev, customContactMethod: "" }));
      }
    } else {
      // Clear error if not "Other"
      setErrors(prev => ({ ...prev, customContactMethod: "" }));
      isValid = true;
    }
    
    onValidation?.("customContactMethod", isValid);
    return isValid;
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

  const handleContactPreferenceBlur = () => {
    setTouched(prev => ({ ...prev, contactPreference: true }));
    validateContactPreference(contactPreference);
  };

  const handleCustomContactMethodBlur = () => {
    setTouched(prev => ({ ...prev, customContactMethod: true }));
    validateCustomContactMethod(customContactMethod);
  };

  // Run validation when values change (but only show errors if touched)
  useEffect(() => {
    validateEmail(email);
  }, [email, touched.email]);

  useEffect(() => {
    validatePassword(password);
  }, [password, touched.password]);

  useEffect(() => {
    validateContactPreference(contactPreference);
  }, [contactPreference, touched.contactPreference]);

  useEffect(() => {
    validateCustomContactMethod(customContactMethod);
  }, [customContactMethod, contactPreference, touched.customContactMethod]);

  // Handle contact preference change
  const handleContactPreferenceChange = (value: string) => {
    onContactPreferenceChange(value);
    setTouched(prev => ({ ...prev, contactPreference: true }));
    
    // Clear custom method if not "Other"
    if (value !== "other") {
      onCustomContactMethodChange("");
      setTouched(prev => ({ ...prev, customContactMethod: false }));
    }
  };

  // Handle custom contact method change
  const handleCustomContactMethodChange = (value: string) => {
    onCustomContactMethodChange(value);
    setTouched(prev => ({ ...prev, customContactMethod: true }));
  };

  return (
    <div className="space-y-6">
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

      {/* Contact Preference */}
      <div className="space-y-2">
        <Label htmlFor="contactPreference" className="text-base font-medium">
          What's the most reliable way to get in contact with you?
        </Label>
        <Select
          value={contactPreference}
          onValueChange={handleContactPreferenceChange}
          onOpenChange={(open) => {
            if (!open) {
              handleContactPreferenceBlur();
            }
          }}
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Select your preferred contact method" />
          </SelectTrigger>
          <SelectContent>
            {CONTACT_OPTIONS.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {errors.contactPreference && (
          <p className="text-sm text-red-600">{errors.contactPreference}</p>
        )}

        {/* Custom contact method input - only shown when "Other" is selected */}
        {contactPreference === "other" && (
          <div className="space-y-2">
            <Input
              type="text"
              value={customContactMethod}
              onChange={(e) => handleCustomContactMethodChange(e.target.value)}
              onBlur={handleCustomContactMethodBlur}
              placeholder="e.g., Discord, Telegram, Signal..."
              className="w-full"
            />
            {errors.customContactMethod && (
              <p className="text-sm text-red-600">{errors.customContactMethod}</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};