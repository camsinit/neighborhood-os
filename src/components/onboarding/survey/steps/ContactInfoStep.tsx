
import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";

/**
 * Contact Information Step Component
 * 
 * This step collects the user's email and phone number with validation
 * to ensure both fields are provided in the correct format.
 * Also includes privacy controls for contact visibility to neighbors.
 */
interface ContactInfoStepProps {
  email: string;
  phone: string;
  onEmailChange: (value: string) => void;
  onPhoneChange: (value: string) => void;
  onValidation?: (field: string, isValid: boolean) => void;
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
    visibility: "",
  });

  // Track contact visibility preferences
  const [contactVisibility, setContactVisibility] = useState({
    showEmail: true,
    showPhone: false,
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

  // Validate phone format and notify parent - now required
  const validatePhone = (value: string) => {
    let isValid = true;
    
    if (!value.trim()) {
      setErrors(prev => ({ ...prev, phone: "Phone number is required" }));
      isValid = false;
    } else {
      // Simple phone validation - at least 10 digits
      const phoneDigits = value.replace(/\D/g, '');
      isValid = phoneDigits.length >= 10;
      
      if (!isValid) {
        setErrors(prev => ({ ...prev, phone: "Please enter a valid phone number (at least 10 digits)" }));
      } else {
        setErrors(prev => ({ ...prev, phone: "" }));
      }
    }
    
    // Notify parent component of validation result
    onValidation?.("phone", isValid);
    return isValid;
  };

  // Validate that at least one contact method is visible
  const validateVisibility = () => {
    const isValid = contactVisibility.showEmail || contactVisibility.showPhone;
    
    if (!isValid) {
      setErrors(prev => ({ 
        ...prev, 
        visibility: "You must make at least one contact method visible to neighbors" 
      }));
    } else {
      setErrors(prev => ({ ...prev, visibility: "" }));
    }
    
    // Notify parent component of validation result
    onValidation?.("contactVisibility", isValid);
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

  // Handle visibility checkbox changes
  const handleVisibilityChange = (field: 'showEmail' | 'showPhone', checked: boolean) => {
    setContactVisibility(prev => ({
      ...prev,
      [field]: checked
    }));
  };

  // Run validation on mount and whenever values change
  useEffect(() => {
    validateEmail(email);
  }, [email]);

  useEffect(() => {
    validatePhone(phone);
  }, [phone]);

  useEffect(() => {
    validateVisibility();
  }, [contactVisibility]);

  return (
    <div className="space-y-6">
      {/* Email field */}
      <div className="space-y-2">
        <Label htmlFor="email">Email Address *</Label>
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
      
      {/* Phone field - now required */}
      <div className="space-y-2">
        <Label htmlFor="phone">Phone Number *</Label>
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
          required
        />
        {errors.phone && (
          <p className="text-sm text-red-500">{errors.phone}</p>
        )}
        <p className="text-sm text-muted-foreground">
          Required. Only visible to neighborhood administrators in case of emergency.
        </p>
      </div>

      {/* Contact visibility preferences */}
      <div className="space-y-4 p-4 border rounded-lg bg-gray-50">
        <div>
          <h3 className="font-medium text-sm mb-2">Neighbor Profile Visibility</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Choose which contact information other neighbors can see on your public profile. 
            You must make at least one contact method visible.
          </p>
        </div>

        <div className="space-y-3">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="show-email"
              checked={contactVisibility.showEmail}
              onCheckedChange={(checked) => handleVisibilityChange('showEmail', checked as boolean)}
            />
            <Label 
              htmlFor="show-email" 
              className="text-sm font-normal cursor-pointer"
            >
              Show email address to neighbors
            </Label>
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="show-phone"
              checked={contactVisibility.showPhone}
              onCheckedChange={(checked) => handleVisibilityChange('showPhone', checked as boolean)}
            />
            <Label 
              htmlFor="show-phone" 
              className="text-sm font-normal cursor-pointer"
            >
              Show phone number to neighbors
            </Label>
          </div>
        </div>

        {errors.visibility && (
          <p className="text-sm text-red-500">{errors.visibility}</p>
        )}
      </div>
    </div>
  );
};
