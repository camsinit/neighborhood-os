
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
 * 
 * UPDATED: Now includes password field for guest onboarding
 * UPDATED: Only shows validation errors after fields are touched
 */
interface ContactInfoStepProps {
  email: string;
  phone: string;
  password?: string;
  emailVisible: boolean;
  phoneVisible: boolean;
  addressVisible: boolean;
  onEmailChange: (value: string) => void;
  onPhoneChange: (value: string) => void;
  onPasswordChange?: (value: string) => void;
  onEmailVisibleChange: (value: boolean) => void;
  onPhoneVisibleChange: (value: boolean) => void;
  onAddressVisibleChange: (value: boolean) => void;
  onValidation?: (field: string, isValid: boolean) => void;
  isGuestMode?: boolean;
}

export const ContactInfoStep = ({
  email,
  phone,
  password = "",
  emailVisible,
  phoneVisible,
  addressVisible,
  onEmailChange,
  onPhoneChange,
  onPasswordChange,
  onEmailVisibleChange,
  onPhoneVisibleChange,
  onAddressVisibleChange,
  onValidation,
  isGuestMode = false,
}: ContactInfoStepProps) => {
  // Track validation errors
  const [errors, setErrors] = useState({
    email: "",
    phone: "",
    password: "",
    visibility: "",
  });

  // Track if fields have been touched by the user to prevent immediate error display
  const [touched, setTouched] = useState({
    email: false,
    phone: false,
    password: false,
    visibility: false,
  });

  // Check if we're in guest mode (has guestOnboarding data in localStorage)
  const isActualGuestMode = isGuestMode || !!localStorage.getItem('guestOnboarding');

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

  // Validate phone format and notify parent - now required
  const validatePhone = (value: string) => {
    let isValid = true;
    
    if (!value.trim()) {
      if (touched.phone) {
        setErrors(prev => ({ ...prev, phone: "Phone number is required" }));
      }
      isValid = false;
    } else {
      // Simple phone validation - at least 10 digits
      const phoneDigits = value.replace(/\D/g, '');
      isValid = phoneDigits.length >= 10;
      
      if (!isValid && touched.phone) {
        setErrors(prev => ({ ...prev, phone: "Please enter a valid phone number (at least 10 digits)" }));
      } else {
        setErrors(prev => ({ ...prev, phone: "" }));
      }
    }
    
    // Notify parent component of validation result
    onValidation?.("phone", isValid);
    return isValid;
  };

  // Validate password for guest mode
  const validatePassword = (value: string) => {
    if (!isActualGuestMode) return true;
    
    let isValid = true;
    
    if (!value.trim()) {
      if (touched.password) {
        setErrors(prev => ({ ...prev, password: "Password is required" }));
      }
      isValid = false;
    } else if (value.length < 6) {
      if (touched.password) {
        setErrors(prev => ({ ...prev, password: "Password must be at least 6 characters" }));
      }
      isValid = false;
    } else {
      setErrors(prev => ({ ...prev, password: "" }));
    }
    
    // Notify parent component of validation result
    onValidation?.("password", isValid);
    return isValid;
  };

  // Validate that at least one contact method is visible
  const validateVisibility = () => {
    const isValid = emailVisible || phoneVisible;
    
    if (!isValid && touched.visibility) {
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

  // Handle field blur to mark as touched and validate
  const handleEmailBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    setTouched(prev => ({ ...prev, email: true }));
    validateEmail(e.target.value);
  };

  const handlePhoneBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    setTouched(prev => ({ ...prev, phone: true }));
    validatePhone(e.target.value);
  };

  const handlePasswordBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    setTouched(prev => ({ ...prev, password: true }));
    validatePassword(e.target.value);
  };

  // Handle visibility checkbox changes
  const handleVisibilityChange = () => {
    setTouched(prev => ({ ...prev, visibility: true }));
    setTimeout(() => validateVisibility(), 0); // Use setTimeout to ensure state is updated
  };

  // Run validation when values change (but only show errors if touched)
  useEffect(() => {
    validateEmail(email);
  }, [email, touched.email]);

  useEffect(() => {
    validatePhone(phone);
  }, [phone, touched.phone]);

  useEffect(() => {
    if (isActualGuestMode) {
      validatePassword(password);
    }
  }, [password, touched.password, isActualGuestMode]);

  useEffect(() => {
    validateVisibility();
  }, [emailVisible, phoneVisible, touched.visibility]);

  return (
    <div className="space-y-6">
      {/* Email, Phone, and Password fields */}
      <div className="grid grid-cols-1 gap-4">
        {/* Email field */}
        <div className="space-y-2">
          <Label htmlFor="email">Email Address *</Label>
          <Input
            id="email"
            type="email"
            value={email}
            onChange={(e) => onEmailChange(e.target.value)}
            onBlur={handleEmailBlur}
            className={errors.email ? "border-red-500" : ""}
            required
          />
          {errors.email && (
            <p className="text-sm text-red-500">{errors.email}</p>
          )}
          <p className="text-sm text-muted-foreground">
            {isActualGuestMode 
              ? "This will be your login email address."
              : "Your email will only be shared with neighborhood administrators."
            }
          </p>
        </div>

        {/* Password field - only for guest mode */}
        {isActualGuestMode && (
          <div className="space-y-2">
            <Label htmlFor="password">Password *</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => onPasswordChange?.(e.target.value)}
              onBlur={handlePasswordBlur}
              className={errors.password ? "border-red-500" : ""}
              placeholder="Choose a secure password"
              required
            />
            {errors.password && (
              <p className="text-sm text-red-500">{errors.password}</p>
            )}
            <p className="text-sm text-muted-foreground">
              Must be at least 6 characters long.
            </p>
          </div>
        )}
        
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
            onBlur={handlePhoneBlur}
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
              checked={emailVisible}
              onCheckedChange={(checked) => {
                onEmailVisibleChange(checked as boolean);
                handleVisibilityChange();
              }}
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
              checked={phoneVisible}
              onCheckedChange={(checked) => {
                onPhoneVisibleChange(checked as boolean);
                handleVisibilityChange();
              }}
            />
            <Label 
              htmlFor="show-phone" 
              className="text-sm font-normal cursor-pointer"
            >
              Show phone number to neighbors
            </Label>
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="show-address"
              checked={addressVisible}
              onCheckedChange={(checked) => {
                onAddressVisibleChange(checked as boolean);
                handleVisibilityChange();
              }}
            />
            <Label 
              htmlFor="show-address" 
              className="text-sm font-normal cursor-pointer"
            >
              Show address to neighbors
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
