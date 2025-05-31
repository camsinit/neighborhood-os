
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

/**
 * ContactFields Component
 * 
 * Renders the email and phone input fields side by side with validation.
 * Handles formatting and validation for both contact methods.
 */
interface ContactFieldsProps {
  email: string;
  phone: string;
  emailError: string;
  phoneError: string;
  onEmailChange: (value: string) => void;
  onPhoneChange: (value: string) => void;
  onEmailBlur: () => void;
  onPhoneBlur: () => void;
}

export const ContactFields = ({
  email,
  phone,
  emailError,
  phoneError,
  onEmailChange,
  onPhoneChange,
  onEmailBlur,
  onPhoneBlur,
}: ContactFieldsProps) => {
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
    <div className="grid grid-cols-2 gap-3">
      {/* Email field */}
      <div className="space-y-2">
        <Label htmlFor="email">Email Address *</Label>
        <Input
          id="email"
          type="email"
          value={email}
          onChange={(e) => onEmailChange(e.target.value)}
          onBlur={onEmailBlur}
          className={emailError ? "border-red-500" : ""}
          required
        />
        {emailError && (
          <p className="text-xs text-red-500">{emailError}</p>
        )}
      </div>
      
      {/* Phone field */}
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
          onBlur={onPhoneBlur}
          className={phoneError ? "border-red-500" : ""}
          placeholder="(123) 456-7890"
          required
        />
        {phoneError && (
          <p className="text-xs text-red-500">{phoneError}</p>
        )}
      </div>
    </div>
  );
};
