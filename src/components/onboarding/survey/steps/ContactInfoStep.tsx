
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

/**
 * Contact Information Step Component
 * 
 * This step collects the user's email and phone number
 * with validation and formatting for proper contact details.
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

  // Format phone number as user types (xxx) xxx-xxxx
  const formatPhoneNumber = (value: string) => {
    // Remove all non-numeric characters
    const numbers = value.replace(/\D/g, "");
    
    // Format based on length
    if (numbers.length <= 3) {
      return numbers;
    } else if (numbers.length <= 6) {
      return `(${numbers.slice(0, 3)}) ${numbers.slice(3)}`;
    } else {
      return `(${numbers.slice(0, 3)}) ${numbers.slice(3, 6)}-${numbers.slice(6, 10)}`;
    }
  };

  // Validate email with regex
  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email.trim()) {
      setErrors(prev => ({ ...prev, email: "Email is required" }));
      return false;
    } else if (!emailRegex.test(email)) {
      setErrors(prev => ({ ...prev, email: "Please enter a valid email address" }));
      return false;
    }
    setErrors(prev => ({ ...prev, email: "" }));
    return true;
  };

  // Validate phone number
  const validatePhone = (phone: string) => {
    const phoneDigits = phone.replace(/\D/g, "");
    if (!phone.trim()) {
      setErrors(prev => ({ ...prev, phone: "Phone number is required" }));
      return false;
    } else if (phoneDigits.length < 10) {
      setErrors(prev => ({ ...prev, phone: "Please enter a complete phone number" }));
      return false;
    }
    setErrors(prev => ({ ...prev, phone: "" }));
    return true;
  };

  return (
    <div className="space-y-6">
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
        {errors.email && <p className="text-sm text-red-500">{errors.email}</p>}
        <p className="text-sm text-muted-foreground">
          We'll use this to send you important community updates and notifications.
        </p>
      </div>
      <div className="space-y-2">
        <Label htmlFor="phone">Phone Number</Label>
        <Input
          id="phone"
          type="tel"
          value={phone}
          onChange={(e) => onPhoneChange(formatPhoneNumber(e.target.value))}
          onBlur={(e) => validatePhone(e.target.value)}
          placeholder="(555) 555-5555"
          className={errors.phone ? "border-red-500" : ""}
          maxLength={14}
          required
        />
        {errors.phone && <p className="text-sm text-red-500">{errors.phone}</p>}
        <p className="text-sm text-muted-foreground">
          For emergency contacts and time-sensitive community alerts.
        </p>
      </div>
    </div>
  );
};
