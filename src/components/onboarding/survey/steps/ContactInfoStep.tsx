
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState, useEffect } from "react";

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
  // Track field touch state for validation feedback
  const [touched, setTouched] = useState({
    email: false,
    phone: false,
  });
  
  // Email validation
  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email) ? "" : "Please enter a valid email address";
  };
  
  // Phone formatting and validation
  const formatPhoneNumber = (value: string) => {
    // Remove all non-digit characters
    const numbers = value.replace(/\D/g, "");
    
    // Format the phone number as (XXX) XXX-XXXX
    if (numbers.length <= 3) return numbers;
    if (numbers.length <= 6) return `(${numbers.slice(0, 3)}) ${numbers.slice(3)}`;
    return `(${numbers.slice(0, 3)}) ${numbers.slice(3, 6)}-${numbers.slice(6, 10)}`;
  };
  
  // Compute validation errors
  const emailError = touched.email && email ? validateEmail(email) : "";
  const phoneError = touched.phone && !phone.trim() ? "Phone number is required" : 
                     touched.phone && !/^\(\d{3}\) \d{3}-\d{4}$/.test(phone) ? 
                     "Please enter a complete phone number" : "";

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="email" className={emailError ? "text-red-500" : ""}>
          Email Address*
        </Label>
        <Input
          id="email"
          type="email"
          value={email}
          onChange={(e) => onEmailChange(e.target.value)}
          onBlur={() => setTouched(prev => ({ ...prev, email: true }))}
          className={emailError ? "border-red-500" : ""}
          placeholder="your.email@example.com"
          required
        />
        {emailError && <p className="text-sm text-red-500">{emailError}</p>}
        <p className="text-sm text-muted-foreground">
          We'll use this to send you important community updates and notifications.
        </p>
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="phone" className={phoneError ? "text-red-500" : ""}>
          Phone Number*
        </Label>
        <Input
          id="phone"
          type="tel"
          value={phone}
          onChange={(e) => onPhoneChange(formatPhoneNumber(e.target.value))}
          onBlur={() => setTouched(prev => ({ ...prev, phone: true }))}
          placeholder="(555) 555-5555"
          className={phoneError ? "border-red-500" : ""}
          maxLength={14}
          required
        />
        {phoneError && <p className="text-sm text-red-500">{phoneError}</p>}
        <p className="text-sm text-muted-foreground">
          For emergency contacts and time-sensitive community alerts.
        </p>
      </div>
    </div>
  );
};
