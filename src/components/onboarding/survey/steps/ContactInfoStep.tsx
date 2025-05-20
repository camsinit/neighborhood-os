import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";

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
  const [emailError, setEmailError] = useState("");
  
  const formatPhoneNumber = (value: string) => {
    const numbers = value.replace(/\D/g, "");
    if (numbers.length <= 3) return numbers;
    if (numbers.length <= 6) return `(${numbers.slice(0, 3)}) ${numbers.slice(3)}`;
    return `(${numbers.slice(0, 3)}) ${numbers.slice(3, 6)}-${numbers.slice(6, 10)}`;
  };

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setEmailError("Please enter a valid email address");
    } else {
      setEmailError("");
    }
  };

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          value={email}
          onChange={(e) => {
            onEmailChange(e.target.value);
            validateEmail(e.target.value);
          }}
          onBlur={(e) => validateEmail(e.target.value)}
          className={emailError ? "border-red-500" : ""}
          required
        />
        {emailError && <p className="text-sm text-red-500">{emailError}</p>}
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
          placeholder="(555) 555-5555"
          maxLength={14}
          required
        />
        <p className="text-sm text-muted-foreground">
          For emergency contacts and time-sensitive community alerts.
        </p>
      </div>
    </div>
  );
};