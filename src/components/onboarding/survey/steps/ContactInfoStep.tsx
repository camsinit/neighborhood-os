
import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

/**
 * Contact Information Step Component
 * 
 * This step collects the user's email and phone number
 * with validation to ensure both fields are provided in the correct format.
 */
interface ContactInfoStepProps {
  email: string;
  phone: string;
  onEmailChange: (value: string) => void;
  onPhoneChange: (value: string) => void;
  onValidation?: (field: string, isValid: boolean) => void; // Add validation callback
}

export const ContactInfoStep = ({
  email,
  phone,
  onEmailChange,
  onPhoneChange,
  onValidation,
}: ContactInfoStepProps) => {
  // Track validation errors
  const [errors, setErrors] = useState({
    email: "",
    phone: "",
  });

  // Validate email format using regex and notify parent
  const validateEmail = (value: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    let isValid = true;
    
    if (!value.trim()) {
      setErrors(prev => ({ ...prev, email: "Email is required" }));
      isValid = false;
    } else if (!emailRegex.test(value)) {
      setErrors(prev => ({ ...prev, email: "Please enter a valid email address" }));
      isValid = false;
    } else {
      setErrors(prev => ({ ...prev, email: "" }));
    }
    
    // Notify parent component of validation result
    onValidation?.("email", isValid);
    return isValid;
  };

  // Validate phone format and notify parent
  const validatePhone = (value: string) => {
    // Allow empty phone for now (not required)
    if (!value.trim()) {
      setErrors(prev => ({ ...prev, phone: "" }));
      onValidation?.("phone", true);
      return true;
    }
    
    // Simple phone validation - at least 10 digits
    const phoneDigits = value.replace(/\D/g, '');
    const isValid = phoneDigits.length >= 10;
    
    if (!isValid) {
      setErrors(prev => ({ ...prev, phone: "Please enter a valid phone number" }));
    } else {
      setErrors(prev => ({ ...prev, phone: "" }));
    }
    
    // Notify parent component of validation result
    onValidation?.("phone", isValid);
    return isValid;
  };
  
  // Format phone number as user types
  const formatPhoneNumber = (value: string) => {
    // Remove non-digit characters
    const phoneDigits = value.replace(/\D/g, '');
    
    // Format based on length
    let formattedPhone = '';
    
    if (phoneDigits.length <= 3) {
      formattedPhone = phoneDigits;
    } else if (phoneDigits.length <= 6) {
      formattedPhone = `(${phoneDigits.slice(0, 3)}) ${phoneDigits.slice(3)}`;
    } else {
      formattedPhone = `(${phoneDigits.slice(0, 3)}) ${phoneDigits.slice(3, 6)}-${phoneDigits.slice(6, 10)}`;
    }
    
    return formattedPhone;
  };

  // Run validation on mount and whenever values change
  useEffect(() => {
    validateEmail(email);
  }, [email]);

  useEffect(() => {
    validatePhone(phone);
  }, [phone]);

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="email">Email Address</Label>
        <Input
          id="email"
          type="email"
          value={email}
          onChange={(e) => onEmailChange(e.target.value)}
          onBlur={(e) => validateEmail(e.target.value)}
          className={errors.email ? "border-red-500" : ""}
          required
        />
        {errors.email && (
          <p className="text-sm text-red-500">{errors.email}</p>
        )}
        <p className="text-sm text-muted-foreground">
          Your email will only be shared with neighborhood administrators.
        </p>
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="phone">Phone Number</Label>
        <Input
          id="phone"
          type="tel"
          value={phone}
          onChange={(e) => {
            // Format phone number as user types
            const formattedPhone = formatPhoneNumber(e.target.value);
            onPhoneChange(formattedPhone);
          }}
          onBlur={(e) => validatePhone(e.target.value)}
          className={errors.phone ? "border-red-500" : ""}
          placeholder="(123) 456-7890"
        />
        {errors.phone && (
          <p className="text-sm text-red-500">{errors.phone}</p>
        )}
        <p className="text-sm text-muted-foreground">
          Optional. Only visible to neighborhood administrators in case of emergency.
        </p>
      </div>
    </div>
  );
};
