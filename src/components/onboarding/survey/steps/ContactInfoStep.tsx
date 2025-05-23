
import { useState } from "react";
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
}

export const ContactInfoStep = ({
  email,
  phone,
  onEmailChange,
  onPhoneChange,
}: ContactInfoStepProps) => {
  // Track validation errors
  const [errors, setErrors] = useState({
    email: "",
    phone: "",
  });

  // Validate email format using regex
  const validateEmail = (value: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    
    if (!value.trim()) {
      setErrors(prev => ({ ...prev, email: "Email is required" }));
      return false;
    }
    
    if (!emailRegex.test(value)) {
      setErrors(prev => ({ ...prev, email: "Please enter a valid email address" }));
      return false;
    }
    
    setErrors(prev => ({ ...prev, email: "" }));
    return true;
  };

  // Validate phone format
  const validatePhone = (value: string) => {
    // Allow empty phone for now (not required)
    if (!value.trim()) {
      return true;
    }
    
    // Simple phone validation - at least 10 digits
    const phoneDigits = value.replace(/\D/g, '');
    
    if (phoneDigits.length < 10) {
      setErrors(prev => ({ ...prev, phone: "Please enter a valid phone number" }));
      return false;
    }
    
    setErrors(prev => ({ ...prev, phone: "" }));
    return true;
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

