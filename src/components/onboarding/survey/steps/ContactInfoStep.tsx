import { useState, useEffect } from "react";
import { ContactFields } from "./contact/ContactFields";
import { PasswordField } from "./contact/PasswordField";
import { VisibilityToggle } from "./contact/VisibilityToggle";

/**
 * Contact Information Step Component
 * 
 * This step collects the user's email, phone number, and password with validation
 * to ensure all fields are provided in the correct format.
 * Also includes privacy controls for contact visibility to neighbors.
 * 
 * REFACTORED: Broken into smaller focused components for better maintainability
 * UPDATED: Compact layout with side-by-side fields and collapsible visibility options
 * UPDATED: Only shows validation errors after fields are touched
 * UPDATED: Defaults to email visibility enabled and options collapsed
 */
interface ContactInfoStepProps {
  email: string;
  phone: string;
  password: string;
  emailVisible: boolean;
  phoneVisible: boolean;
  addressVisible: boolean;
  onEmailChange: (value: string) => void;
  onPhoneChange: (value: string) => void;
  onPasswordChange: (value: string) => void;
  onEmailVisibleChange: (value: boolean) => void;
  onPhoneVisibleChange: (value: boolean) => void;
  onAddressVisibleChange: (value: boolean) => void;
  onValidation?: (field: string, isValid: boolean) => void;
}

export const ContactInfoStep = ({
  email,
  phone,
  password,
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

  // Track visibility options toggle state - starts collapsed
  const [showVisibilityOptions, setShowVisibilityOptions] = useState(false);

  // Initialize email visibility to true if not already set
  useEffect(() => {
    if (!emailVisible && !phoneVisible) {
      onEmailVisibleChange(true);
    }
  }, [emailVisible, phoneVisible, onEmailVisibleChange]);

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

  // Validate password - now always required since this is for account creation
  const validatePassword = (value: string) => {
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

  // Validate that at least one contact method is visible (email or phone)
  const validateVisibility = () => {
    const isValid = emailVisible || phoneVisible;
    
    if (!isValid && touched.visibility) {
      setErrors(prev => ({ 
        ...prev, 
        visibility: "You must make either email or phone visible to neighbors" 
      }));
    } else {
      setErrors(prev => ({ ...prev, visibility: "" }));
    }
    
    // Notify parent component of validation result
    onValidation?.("contactVisibility", isValid);
    return isValid;
  };

  // Handle field blur to mark as touched and validate
  const handleEmailBlur = () => {
    setTouched(prev => ({ ...prev, email: true }));
    validateEmail(email);
  };

  const handlePhoneBlur = () => {
    setTouched(prev => ({ ...prev, phone: true }));
    validatePhone(phone);
  };

  const handlePasswordBlur = () => {
    setTouched(prev => ({ ...prev, password: true }));
    validatePassword(password);
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
    validatePassword(password);
  }, [password, touched.password]);

  useEffect(() => {
    validateVisibility();
  }, [emailVisible, phoneVisible, touched.visibility]);

  return (
    <div className="space-y-4">
      {/* Email and Phone side by side */}
      <ContactFields
        email={email}
        phone={phone}
        emailError={errors.email}
        phoneError={errors.phone}
        onEmailChange={onEmailChange}
        onPhoneChange={onPhoneChange}
        onEmailBlur={handleEmailBlur}
        onPhoneBlur={handlePhoneBlur}
      />

      {/* Password field - full width */}
      <PasswordField
        password={password}
        passwordError={errors.password}
        onPasswordChange={onPasswordChange}
        onPasswordBlur={handlePasswordBlur}
      />

      {/* Contact visibility toggle */}
      <VisibilityToggle
        emailVisible={emailVisible}
        phoneVisible={phoneVisible}
        addressVisible={addressVisible}
        visibilityError={errors.visibility}
        showOptions={showVisibilityOptions}
        onEmailVisibleChange={onEmailVisibleChange}
        onPhoneVisibleChange={onPhoneVisibleChange}
        onAddressVisibleChange={onAddressVisibleChange}
        onToggleOptions={setShowVisibilityOptions}
        onVisibilityChange={handleVisibilityChange}
      />
    </div>
  );
};
